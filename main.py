from __future__ import annotations

import os
import urllib.request
import urllib.parse
import json
import importlib
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import random

from database import NCLEX_QUESTIONS, SIMULATION_CASES, CRITICAL_LAB_VALUES, DRUG_CARDS

try:
    load_dotenv = importlib.import_module("dotenv").load_dotenv
    load_dotenv()
except Exception:
    pass

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_QUESTION_BATCH_SIZE = int(os.getenv("OPENAI_QUESTION_BATCH_SIZE", "10"))
OPENAI_QUESTION_MAX_COUNT = int(os.getenv("OPENAI_QUESTION_MAX_COUNT", "1000"))
AI_QUESTION_BANK_CACHE: dict[str, list[dict[str, Any]]] = {}


def get_openai_client(api_key_override: Optional[str] = None):
    api_key = (os.getenv("OPENAI_API_KEY") or api_key_override or "").strip()
    if not api_key:
        return None

    from openai import OpenAI

    return OpenAI(api_key=api_key)


def build_openai_messages(system_prompt: str, history: List[ChatMessage], user_message: str, history_limit: int = 6):
    messages = [{"role": "system", "content": system_prompt}]
    for msg in history[-history_limit:]:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": user_message})
    return messages


def call_openai_chat(api_key_override: Optional[str], system_prompt: str, history: List[ChatMessage], user_message: str, max_tokens: int, temperature: float):
    client = get_openai_client(api_key_override)
    if client is None:
        return None

    completion = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=build_openai_messages(system_prompt, history, user_message),
        max_tokens=max_tokens,
        temperature=temperature,
    )
    response_text = completion.choices[0].message.content or ""
    return {"response": response_text, "source": "openai", "model": OPENAI_MODEL}


def call_openai_research(api_key_override: Optional[str], system_prompt: str, user_prompt: str, max_tokens: int, temperature: float):
    client = get_openai_client(api_key_override)
    if client is None:
        return None

    completion = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=max_tokens,
        temperature=temperature,
    )
    report_text = completion.choices[0].message.content or ""
    return {"report": report_text, "source": "openai", "model": OPENAI_MODEL}


def call_openai_json(api_key_override: Optional[str], system_prompt: str, user_prompt: str, temperature: float = 0.2):
    client = get_openai_client(api_key_override)
    if client is None:
        return None

    completion = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=temperature,
        response_format={"type": "json_object"},
    )
    content = completion.choices[0].message.content or "{}"
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return None


def fetch_mcp_bridge_context(bridge_url: Optional[str], query: str):
    bridge = (bridge_url or os.getenv("MCP_BRIDGE_URL") or "").strip()
    if not bridge:
        return None

    try:
        separator = "&" if "?" in bridge else "?"
        url = f"{bridge}{separator}query={urllib.parse.quote(query)}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=8) as response:
            payload = response.read().decode()

        try:
            data = json.loads(payload)
            if isinstance(data, dict):
                return {
                    "summary": data.get("summary") or data.get("content") or data.get("text") or payload[:1200],
                    "raw": data,
                }
        except json.JSONDecodeError:
            pass

        return {"summary": payload[:1200], "raw": None}
    except Exception as exc:
        print(f"MCP bridge lookup failed: {exc}")
        return {"summary": None, "error": str(exc), "raw": None}


def build_agentic_steps(query: str, trials: list, articles: list, mcp_context: Optional[dict]):
    steps = [
        "Clarify the question and define the nursing problem.",
        f"Collect evidence from {len(trials)} trial records and {len(articles)} literature records.",
    ]
    if mcp_context and mcp_context.get("summary"):
        steps.append("Incorporate MCP bridge context into the synthesis.")
    steps.append("Synthesize an answer with nursing-safe recommendations and follow-up actions.")
    return steps


def get_question_categories() -> list[str]:
    return sorted({question["category"] for question in NCLEX_QUESTIONS})


def get_question_seed_examples(category: Optional[str], limit: int = 3) -> list[dict[str, Any]]:
    if category and category.lower() not in {"all", "mock_exam"}:
        seeds = [question for question in NCLEX_QUESTIONS if question["category"].lower() == category.lower()]
    else:
        seeds = list(NCLEX_QUESTIONS)
    return seeds[:limit] if seeds else list(NCLEX_QUESTIONS[:limit])


def generate_ai_question_batch(api_key_override: Optional[str], category: Optional[str], batch_size: int, used_questions: list[str]):
    seed_examples = get_question_seed_examples(category)
    example_text = []
    for example in seed_examples:
        example_text.append(
            f"Category: {example['category']}\nQuestion: {example['question']}\nOptions: {json.dumps(example['options'])}\nCorrectIndex: {example['correctIndex']}\nRationale: {example['rationale']}"
        )

    category_label = "mixed NCLEX categories" if not category or category.lower() in {"all", "mock_exam"} else category
    used_text = "\n".join([f"- {question[:180]}" for question in used_questions[-25:]]) or "None"

    system_prompt = (
        "You are an expert NCLEX question author. Generate high-quality, clinically accurate, original nursing questions. "
        "Each item must have exactly 4 answer choices, one correct answer, and a thorough rationale. "
        "Use only valid nursing concepts and avoid duplicate stems."
    )
    user_prompt = (
        f"Generate exactly {batch_size} unique NCLEX-style questions for {category_label}.\n"
        "Return a JSON object with a single key named questions.\n"
        "Each question object must contain: category, question, options, correctIndex, rationale.\n"
        "Rules:\n"
        "- options must be an array of 4 strings.\n"
        "- correctIndex must be an integer from 0 to 3.\n"
        "- rationale must explain the correct answer and why the distractors are incorrect.\n"
        "- do not number the question text.\n"
        "- keep the questions clinically realistic and aligned to NCLEX decision-making.\n"
        "- avoid reusing the same stem structure as the example items.\n\n"
        "Style examples:\n"
        + "\n\n".join(example_text)
        + "\n\nRecent generated stems to avoid repeating:\n"
        + used_text
    )

    payload = call_openai_json(api_key_override, system_prompt, user_prompt, temperature=0.8)
    if not payload or not isinstance(payload, dict):
        raise HTTPException(status_code=503, detail="OpenAI could not generate question content.")

    raw_questions = payload.get("questions")
    if not isinstance(raw_questions, list) or len(raw_questions) != batch_size:
        raise HTTPException(status_code=503, detail="OpenAI returned an invalid question batch.")

    normalized_questions = []
    for item in raw_questions:
        if not isinstance(item, dict):
            raise HTTPException(status_code=503, detail="OpenAI returned an invalid question item.")
        options = item.get("options")
        if not isinstance(options, list) or len(options) != 4:
            raise HTTPException(status_code=503, detail="OpenAI returned a question without four options.")
        correct_index = item.get("correctIndex")
        if not isinstance(correct_index, int) or correct_index < 0 or correct_index > 3:
            raise HTTPException(status_code=503, detail="OpenAI returned a question with an invalid correctIndex.")

        normalized_questions.append({
            "category": str(item.get("category") or category_label),
            "question": str(item.get("question") or ""),
            "options": [str(option) for option in options],
            "correctIndex": correct_index,
            "rationale": str(item.get("rationale") or "")
        })

    return normalized_questions


def build_ai_question_bank(api_key_override: Optional[str], category: Optional[str], count: int):
    normalized_category = (category or "all").strip()
    if normalized_category.lower() == "mock_exam":
        normalized_category = "all"

    normalized_count = max(1, min(count, OPENAI_QUESTION_MAX_COUNT))
    cache_key = f"{normalized_category.lower()}::{normalized_count}"
    cached_questions = AI_QUESTION_BANK_CACHE.get(cache_key)
    if cached_questions is not None:
        return cached_questions

    batch_size = max(1, min(OPENAI_QUESTION_BATCH_SIZE, normalized_count))
    generated_questions: list[dict[str, Any]] = []
    seen_stems: list[str] = []

    while len(generated_questions) < normalized_count:
        remaining = normalized_count - len(generated_questions)
        current_batch_size = min(batch_size, remaining)
        batch = generate_ai_question_batch(api_key_override, normalized_category, current_batch_size, seen_stems)
        for question in batch:
            stem = question["question"].strip().lower()
            if stem and stem not in {existing.strip().lower() for existing in seen_stems}:
                generated_questions.append(question)
                seen_stems.append(question["question"])

        if not batch:
            raise HTTPException(status_code=503, detail="OpenAI returned an empty question batch.")

    for index, question in enumerate(generated_questions, start=1):
        question["id"] = index

    AI_QUESTION_BANK_CACHE[cache_key] = generated_questions
    return generated_questions


def run_agentic_research_workflow(api_key_override: Optional[str], query: str, trials: list, articles: list, mcp_context: Optional[dict]):
    planner_prompt = (
        "You are the planning stage of an agentic clinical research workflow. "
        "Return a JSON object with keys: objective, subquestions, evidence_focus, synthesis_risk, next_actions. "
        "The subquestions should be short bullet-like strings. The next_actions should be a list of concise agent steps."
    )
    planner_user_prompt = (
        f"Clinical query: {query}\n"
        f"Available trial count: {len(trials)}\n"
        f"Available article count: {len(articles)}\n"
        f"MCP context present: {bool(mcp_context and mcp_context.get('summary'))}\n"
        "Plan the research workflow before writing the final synthesis."
    )
    plan = call_openai_json(api_key_override, planner_prompt, planner_user_prompt) or {
        "objective": f"Answer the clinical research question: {query}",
        "subquestions": [
            "What is the clinical concern?",
            "What evidence is most relevant?",
            "What nursing actions or safety concerns matter most?",
        ],
        "evidence_focus": ["clinical trials", "recent literature", "MCP context" if mcp_context and mcp_context.get("summary") else "local evidence"],
        "synthesis_risk": "Low-confidence if sources conflict or evidence is sparse.",
        "next_actions": [
            "Gather the strongest available evidence.",
            "Cross-check evidence with MCP context when available.",
            "Synthesize with nursing-safe recommendations.",
        ],
    }

    evidence_summary = []
    if trials:
        evidence_summary.append("Clinical trials:\n" + "\n".join([
            f"- {trial['nctId']}: {trial['title']} ({trial['status']})"
            for trial in trials[:5]
        ]))
    else:
        evidence_summary.append("Clinical trials: none found.")

    if articles:
        evidence_summary.append("PubMed articles:\n" + "\n".join([
            f"- PMID {article['pmid']}: {article['title']} ({article['journal']})"
            for article in articles[:5]
        ]))
    else:
        evidence_summary.append("PubMed articles: none found.")

    if mcp_context and mcp_context.get("summary"):
        evidence_summary.append(f"MCP context:\n- {mcp_context['summary']}")
    elif mcp_context and mcp_context.get("error"):
        evidence_summary.append(f"MCP context error:\n- {mcp_context['error']}")
    else:
        evidence_summary.append("MCP context: not configured.")

    synthesizer_prompt = (
        "You are the synthesis stage of an agentic clinical research workflow. "
        "Write a comprehensive Clinical Insights Report in Markdown with these headings: Executive Summary, Current Clinical Trials & Innovation, Recent Medical Literature Synthesis, Nursing Practice Recommendations. "
        "Use precise nursing language, emphasize patient safety, and keep the response clinically actionable."
    )
    synthesizer_user_prompt = (
        f"Research plan:\n{json.dumps(plan, indent=2)}\n\n"
        f"Clinical question:\n{query}\n\n"
        f"Evidence bundle:\n{chr(10).join(evidence_summary)}\n\n"
        "Create the final report from this evidence bundle."
    )
    synthesis = call_openai_research(api_key_override, synthesizer_prompt, synthesizer_user_prompt, max_tokens=1400, temperature=0.6)

    if synthesis is None:
        raise HTTPException(status_code=503, detail="OpenAI is not configured for research synthesis.")

    report = synthesis["report"]
    source = synthesis["source"]
    model = synthesis.get("model")

    critique_prompt = (
        "You are the critique stage of an agentic clinical research workflow. "
        "Review the draft report for missing safety considerations, weak logic, or unsupported claims. "
        "Return JSON with keys: strengths, gaps, improvement_notes."
    )
    critique_user_prompt = (
        f"Plan:\n{json.dumps(plan, indent=2)}\n\n"
        f"Draft report:\n{report}\n\n"
        "Provide a concise critique."
    )
    critique = call_openai_json(api_key_override, critique_prompt, critique_user_prompt) or {
        "strengths": ["Uses the available evidence bundle.", "Centers nursing safety and patient education."],
        "gaps": [],
        "improvement_notes": ["Verify evidence recency before clinical use."]
    }

    return {
        "report": report,
        "source": source,
        "model": model,
        "plan": plan,
        "critique": critique,
        "workflow_steps": plan.get("next_actions") or build_agentic_steps(query, trials, articles, mcp_context),
    }

app = FastAPI(
    title="Nursing Success AI Tutor API",
    description="Backend API for clinical simulations, NCLEX questions, and AI preceptor chat.",
    version="1.0.0"
)

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
if not STATIC_DIR.exists():
    STATIC_DIR = BASE_DIR

INDEX_FILE = STATIC_DIR / "index.html"
if not INDEX_FILE.exists():
    INDEX_FILE = BASE_DIR / "index.html"


def _get_cors_origins() -> list[str]:
    configured = os.getenv("CORS_ALLOW_ORIGINS", "*")
    origins = [origin.strip() for origin in configured.split(",") if origin.strip()]
    return origins if origins else ["*"]



def save_mcp_bridge_context(bridge_url: Optional[str], key: str, summary: str) -> bool:
    bridge = (bridge_url or os.getenv("MCP_BRIDGE_URL") or "").strip()
    if not bridge:
        return False
    try:
        url = bridge.split('?')[0]
        memory_url = f"{url}/memory" if not url.endswith("/memory") else url
        payload = json.dumps({
            "key": key,
            "value": summary,
            "summary": summary
        }).encode("utf-8")
        req = urllib.request.Request(
            memory_url,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0"
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.getcode() in [200, 201]
    except Exception as exc:
        print(f"MCP save failed (trying fallback): {exc}")
        try:
            req = urllib.request.Request(
                bridge.split('?')[0],
                data=json.dumps({"query": f"Remember for key '{key}': {summary}"}).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                return response.getcode() in [200, 201]
        except Exception as e2:
            print(f"MCP fallback save failed: {e2}")
            return False

def expand_case_with_openai(dept: str, original_case: dict, api_key: Optional[str]) -> Optional[dict]:
    system_prompt = (
        "You are an expert clinical nursing educator. Your task is to expand a basic simulation case "
        "into a highly detailed, 5-step interactive clinical scenario with SBAR, vitals progression, "
        "and decision options. Return only a valid JSON object matching the requested schema."
    )
    user_prompt = (
        f"Expand the clinical simulation case for department '{dept}' (title: '{original_case['title']}').\n"
        "Generate a JSON object with keys: 'title', 'desc', 'sbar', 'initialVitals', and 'steps'.\n"
        "Guidelines:\n"
        "- 'title' must be a professional string (e.g. 'ER Case: Acute Severe Asthma Exacerbation').\n"
        "- 'desc' must be a 2-3 sentence overview.\n"
        "- 'sbar' must be a detailed dictionary with keys: 'situation', 'background', 'assessment', 'recommendation'. "
        "Every SBAR field must contain rich, realistic medical facts (e.g. laboratory numbers, past history, chief complaint).\n"
        "- 'initialVitals' must be a dictionary with keys: 'hr', 'bp', 'rr', 'temp', 'spo2'.\n"
        "- 'steps' must be a list of exactly 5 sequential clinical steps. Every step must have:\n"
        "  * 'text': 3-4 sentences describing the clinical situation, patient signs/symptoms, and nurse findings.\n"
        "  * 'vitals': dict with keys 'hr', 'bp', 'rr', 'temp', 'spo2' reflecting the physiological state at this step.\n"
        "  * 'options': array of exactly 4 choices. Each choice must have:\n"
        "    - 'text': Action description formatted as a nursing command/order (e.g. 'Start high-flow oxygen at 15 L/min via non-rebreather mask').\n"
        "    - 'score': 100 (optimal priority action), 50 (suboptimal action), or 0 (incorrect/unsafe action).\n"
        "    - 'next': integer (from 0 to 4 representing the next step index, or 5 to indicate case completion/discharge).\n"
        "    - 'feedback': A detailed virtual preceptor rationale explaining why the action is correct, incorrect, or suboptimal."
    )
    payload = call_openai_json(api_key, system_prompt, user_prompt)
    if payload and isinstance(payload, dict) and "steps" in payload:
        for step in payload["steps"]:
            if not isinstance(step.get("options"), list) or len(step["options"]) != 4:
                return None
        payload["title"] = "Expanded Case: " + original_case["title"].split(":")[-1].strip()
        return payload
    return None


cors_origins = _get_cors_origins()
allow_credentials = "*" not in cors_origins

# Enable CORS for deployed frontends (configure with CORS_ALLOW_ORIGINS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class ChatMessage(BaseModel):
    role: str  # user or assistant
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage]
    context: Optional[str] = None
    mcp_bridge_url: Optional[str] = None
    api_key: Optional[str] = None

class SimulationActionRequest(BaseModel):
    dept: str
    step: int
    option_index: int
    mcp_bridge_url: Optional[str] = None

class AIDetailRequest(BaseModel):
    query: str
    mcp_bridge_url: Optional[str] = None
    api_key: Optional[str] = None

class ResearchRequest(BaseModel):
    query: str
    include_trials: bool = True
    include_pubmed: bool = True
    mcp_bridge_url: Optional[str] = None
    api_key: Optional[str] = None

class RegisterRequest(BaseModel):
    name: str
    address: str
    email: str
    course: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class SubscribeRequest(BaseModel):
    email: str

# In-memory student user store
USERS_DB = {
    "student@nursing.edu": {
        "password": "password",
        "name": "Student Nurse",
        "address": "123 Health Ave",
        "course": "NCLEX Prep Fast Track",
        "is_premium": True
    }
}

# API Endpoints

@app.post("/api/register")
def register_student(request: RegisterRequest):
    email = request.email.strip().lower()
    if email in USERS_DB:
        raise HTTPException(status_code=400, detail="Email is already registered.")
    
    USERS_DB[email] = {
        "password": request.password,
        "name": request.name,
        "address": request.address,
        "course": request.course,
        "is_premium": False
    }
    
    # Simulate sending email by logging it to the console
    print(f"\n==================================================")
    print(f"[EMAIL SIMULATION] SENDING TO: {email}")
    print(f"Subject: Welcome to Preceptor AI - Registration Confirmation")
    print(f"Dear {request.name},\n")
    print(f"Thank you for registering for the Nursing Success AI Tutor platform.")
    print(f"This email confirms your registration for the course: {request.course}.")
    print(f"You can now log in using your email and password credentials.\n")
    print(f"Happy studying!\nPreceptor AI Support Team")
    print(f"==================================================\n")
    
    return {"status": "success", "message": "Registration successful. A confirmation email has been simulated and printed to the server logs."}

@app.post("/api/login")
def login_student(request: LoginRequest):
    email = request.email.strip().lower()
    if email not in USERS_DB or USERS_DB[email]["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    user = USERS_DB[email]
    return {
        "status": "success",
        "email": email,
        "name": user["name"],
        "course": user["course"],
        "is_premium": user.get("is_premium", False)
    }

@app.post("/api/subscribe")
def subscribe_student(request: SubscribeRequest):
    email = request.email.strip().lower()
    if email not in USERS_DB:
        raise HTTPException(status_code=404, detail="User not found.")
    
    USERS_DB[email]["is_premium"] = True
    return {"status": "success", "message": "Subscription activated successfully."}

@app.get("/api/questions")
def get_questions(category: Optional[str] = None, count: int = 20, api_key: Optional[str] = None):
    """Generate NCLEX questions with OpenAI, optionally filtered by category and count."""
    if count > OPENAI_QUESTION_MAX_COUNT:
        count = OPENAI_QUESTION_MAX_COUNT
    return build_ai_question_bank(api_key, category, count)

@app.get("/api/simulation/cases")
def get_cases():
    """Retrieve list of available departments and descriptions."""
    cases_summary = {}
    for k, v in SIMULATION_CASES.items():
        cases_summary[k] = {
            "title": v["title"],
            "desc": v["desc"],
            "initialVitals": v["initialVitals"]
        }
    return cases_summary

@app.get("/api/simulation/case/{dept}")
def get_case_details(dept: str, mcp_bridge_url: Optional[str] = None, api_key: Optional[str] = None):
    """Retrieve template details for a specific department case, dynamically expanding it via OpenAI if needed."""
    if dept not in SIMULATION_CASES:
        raise HTTPException(status_code=404, detail="Department simulation not found")
    case = SIMULATION_CASES[dept]
    # Expand case using OpenAI if it only has default short (3 steps or less) mock steps
    if len(case.get("steps", [])) <= 3 and not case.get("title", "").startswith("Expanded Case"):
        try:
            expanded = expand_case_with_openai(dept, case, api_key)
            if expanded:
                SIMULATION_CASES[dept] = expanded
                case = expanded
                if mcp_bridge_url:
                    save_mcp_bridge_context(mcp_bridge_url, f"case_details::{dept}", f"Expanded case generated for {case['title']}: {json.dumps(case)}")
        except Exception as exc:
            print(f"Dynamic case expansion failed: {exc}")
    safe_steps = []
    for step in case["steps"]:
        safe_options = [{"text": opt["text"]} for opt in step["options"]]
        safe_steps.append({
            "text": step["text"],
            "vitals": step["vitals"],
            "options": safe_options
        })
    return {
        "title": case["title"],
        "desc": case["desc"],
        "sbar": case["sbar"],
        "steps": safe_steps
    }

@app.post("/api/simulation/action")
def process_simulation_action(request: SimulationActionRequest):
    """Process a user selection in a clinical simulation and return updated state."""
    dept = request.dept
    step_idx = request.step
    opt_idx = request.option_index
    
    if dept not in SIMULATION_CASES:
        raise HTTPException(status_code=404, detail="Department not found")
    
    case = SIMULATION_CASES[dept]
    if step_idx >= len(case["steps"]):
        raise HTTPException(status_code=400, detail="Invalid step index")
        
    step = case["steps"][step_idx]
    if opt_idx >= len(step["options"]):
        raise HTTPException(status_code=400, detail="Invalid option index")
        
    selected_option = step["options"][opt_idx]
    if request.mcp_bridge_url:
        summary = f"Student nurse solved step {step_idx+1} in department '{dept}'. Action selected: '{selected_option['text']}'. Score: {selected_option['score']}/100. Feedback received: {selected_option['feedback']}"
        save_mcp_bridge_context(request.mcp_bridge_url, f"action::sim::{dept}::step::{step_idx}", summary)
    return {
        "score": selected_option["score"],
        "next": selected_option["next"],
        "feedback": selected_option["feedback"]
    }

@app.get("/api/reference/labs")
def get_lab_values():
    """Retrieve reference lab ranges."""
    return CRITICAL_LAB_VALUES

@app.get("/api/reference/drugs")
def get_drug_cards():
    """Retrieve high-yield drug profiles."""
    return DRUG_CARDS

@app.post("/api/reference/ai-detail")
def get_ai_reference_detail(request: AIDetailRequest):
    """Generate an in-depth clinical reference profile for a drug or lab value using OpenAI."""
    query = request.query.strip()
    system_prompt = (
        "You are an expert clinical pharmacology and laboratory diagnostics professor. "
        "Your task is to generate an in-depth clinical study profile for the requested drug or lab value."
    )
    user_prompt = (
        f"Provide a detailed profile for '{query}'.\n"
        "If it is a drug, return a JSON object with keys: name, classification, mechanism, indications, "
        "warnings, nursing_considerations, and a calculation_example. "
        "The calculation_example should walk through a realistic dosage calculation in nursing.\n"
        "If it is a lab value, return a JSON object with keys: name, normal_range, critical_limits, "
        "clinical_significance, elevation_causes, depression_causes, and nursing_interventions.\n"
    )
    payload = call_openai_json(request.api_key, system_prompt, user_prompt)
    if payload and isinstance(payload, dict):
        if request.mcp_bridge_url:
            summary = f"Expanded clinical reference for '{query}': {json.dumps(payload)}"
            save_mcp_bridge_context(request.mcp_bridge_url, f"ref::{query}", summary)
        return payload
    raise HTTPException(status_code=503, detail="OpenAI detail generation failed.")


@app.post("/api/chat")
async def chat_with_preceptor(request: ChatRequest):
    """Interact with the virtual AI Preceptor Sarah using OpenAI."""
    user_message = request.message

    system_prompt = (
        "You are Nurse Preceptor Sarah, an experienced clinical nurse educator with 15+ years of "
        "experience in critical care (ICU), emergency (ER), medical-surgical, pediatrics, maternity, "
        "and mental health nursing. Your role is to mentor student nurses and prepare them for the NCLEX exam.\n\n"
        "Guidelines:\n"
        "- Provide evidence-based, clinically accurate advice.\n"
        "- Structure your answers using bullet points, clear headings, or SBAR outlines where appropriate.\n"
        "- Emphasize clinical safety, the ABCs (Airway, Breathing, Circulation), and delegation principles.\n"
        "- If asked about drug dosages, walk through the calculations.\n"
        "- Keep a supportive, professional, yet highly realistic clinical educator tone."
    )
    if request.context:
        system_prompt += f"\n\nActive Workspace Context:\n{request.context}"
    if request.mcp_bridge_url:
        try:
            mcp_data = fetch_mcp_bridge_context(request.mcp_bridge_url, "nursing_student_recent_activities")
            if mcp_data and mcp_data.get("summary"):
                system_prompt += f"\n\nStudent clinical performance memory (from MCP server):\n{mcp_data['summary']}"
        except Exception as e:
            print(f"Failed to fetch student notes from MCP: {e}")

    try:
        ai_result = call_openai_chat(request.api_key, system_prompt, request.history, user_message, max_tokens=800, temperature=0.7)
        if ai_result is not None:
            return ai_result

        raise HTTPException(status_code=503, detail="OpenAI is not configured for chat responses.")
    except Exception as e:
        print(f"OpenAI connection error: {e}")
        raise HTTPException(status_code=503, detail=f"OpenAI chat request failed: {e}")

# AI CLINICAL RESEARCH AND AGENTIC SYNTHESIS
def fetch_clinical_trials(query: str):
    try:
        safe_query = urllib.parse.quote(query)
        url = f"https://clinicaltrials.gov/api/v2/studies?query.term={safe_query}&pageSize=5"
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            data = json.loads(response.read().decode())
            studies = data.get("studies", [])
            results = []
            for study in studies:
                protocol = study.get("protocolSection", {})
                ident = protocol.get("identificationModule", {})
                status = protocol.get("statusModule", {})
                sponsor = protocol.get("sponsorCollaboratorsModule", {})
                desc = protocol.get("descriptionModule", {})
                
                results.append({
                    "nctId": ident.get("nctId", "N/A"),
                    "title": ident.get("officialTitle", ident.get("briefTitle", "N/A")),
                    "status": status.get("overallStatus", "N/A"),
                    "sponsor": sponsor.get("leadSponsor", {}).get("name", "N/A"),
                    "summary": desc.get("briefSummary", "N/A")[:200] + "..."
                })
            return results
    except Exception as e:
        print(f"Error fetching clinical trials: {e}")
        return []

def fetch_pubmed_articles(query: str):
    try:
        safe_query = urllib.parse.quote(query)
        search_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={safe_query}&retmode=json&retmax=5"
        req1 = urllib.request.Request(
            search_url,
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req1, timeout=8) as response:
            search_data = json.loads(response.read().decode())
            id_list = search_data.get("esearchresult", {}).get("idlist", [])
            
        if not id_list:
            return []
            
        ids_str = ",".join(id_list)
        summary_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={ids_str}&retmode=json"
        req2 = urllib.request.Request(
            summary_url,
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req2, timeout=8) as response:
            summary_data = json.loads(response.read().decode())
            uid_results = summary_data.get("result", {})
            
            results = []
            for uid in id_list:
                if uid == "uids":
                    continue
                article = uid_results.get(uid, {})
                results.append({
                    "pmid": uid,
                    "title": article.get("title", "N/A"),
                    "journal": article.get("source", "N/A"),
                    "pubDate": article.get("pubdate", "N/A"),
                    "authors": ", ".join([a.get("name", "") for a in article.get("authors", [])[:3]])
                })
            return results
    except Exception as e:
        print(f"Error fetching PubMed articles: {e}")
        return []

@app.post("/api/research/generate")
async def generate_research_insights(request: ResearchRequest):
    query = request.query
    include_trials = request.include_trials
    include_pubmed = request.include_pubmed
    mcp_bridge_url = request.mcp_bridge_url
    
    trials = fetch_clinical_trials(query) if include_trials else []
    articles = fetch_pubmed_articles(query) if include_pubmed else []
    mcp_context = fetch_mcp_bridge_context(mcp_bridge_url, query)

    try:
        agent_result = run_agentic_research_workflow(request.api_key, query, trials, articles, mcp_context)
        report = agent_result["report"]
        source = agent_result.get("source", "openai")
        model = agent_result.get("model")
        plan = agent_result.get("plan")
        critique = agent_result.get("critique")
        workflow_steps = agent_result.get("workflow_steps") or build_agentic_steps(query, trials, articles, mcp_context)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"OpenAI research workflow failed: {e}")
        
    return {
        "report": report,
        "trials": trials,
        "articles": articles,
        "source": source,
        "model": model,
        "plan": plan,
        "critique": critique,
        "workflow_steps": workflow_steps,
        "mcp": {
            "configured": bool((mcp_bridge_url or os.getenv("MCP_BRIDGE_URL") or "").strip()),
            "bridge_url": mcp_bridge_url or os.getenv("MCP_BRIDGE_URL"),
            "status": "connected" if mcp_context and mcp_context.get("summary") else "not_connected",
        }
    }


@app.get("/api/ai/status")
def get_ai_status():
    configured = bool((os.getenv("OPENAI_API_KEY") or "").strip())
    mcp_configured = bool((os.getenv("MCP_BRIDGE_URL") or "").strip())
    return {
        "configured": configured,
        "model": OPENAI_MODEL,
        "source": "openai_ready" if configured else "openai_unavailable",
        "mcp_configured": mcp_configured,
        "mcp_bridge_url": os.getenv("MCP_BRIDGE_URL") or None
    }

# Serve separate HTML pages
@app.get("/")
def serve_root():
    return RedirectResponse(url="/login")

@app.get("/login")
def serve_login():
    return FileResponse(STATIC_DIR / "login.html")

@app.get("/dashboard")
def serve_dashboard():
    return FileResponse(STATIC_DIR / "dashboard.html")

@app.get("/interactive-labs")
def serve_labs():
    return FileResponse(STATIC_DIR / "labs.html")

@app.get("/skill-iq")
def serve_skill_iq():
    return FileResponse(STATIC_DIR / "skill-iq.html")

@app.get("/reference")
def serve_reference():
    return FileResponse(STATIC_DIR / "reference.html")

@app.get("/mentor")
def serve_mentor():
    return FileResponse(STATIC_DIR / "mentor.html")

@app.get("/research")
def serve_research():
    return FileResponse(STATIC_DIR / "research.html")


@app.get("/healthz")
def health_check():
    return {"status": "ok"}

# Mount static folder
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

if __name__ == "__main__":
    import uvicorn
    # Use environment-driven host/port for cloud hosting.
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
