// Skill-IQ.js - Client-Side Skill IQ Assessment Logic

let quizQuestions = [];
let currentQuizIndex = 0;
let quizScoreCount = 0;
let selectedOptionIndex = null;
let assessmentTimerInterval = null;
let assessmentTimeLeft = 60;

document.addEventListener('DOMContentLoaded', () => {
    resetSkillIQAssessment();
    bindButtonRipples();
    applyStaggeredReveal('nclex');
});

function startSkillIQAssessment() {
    document.getElementById('skill-iq-welcome-view').style.display = 'none';
    document.getElementById('skill-iq-active-view').style.display = 'block';
    document.getElementById('skill-iq-results-view').style.display = 'none';

    loadQuestionsByCategorySilent('all', 5);
}

async function loadQuestionsByCategorySilent(category, count) {
    const apiKey = localStorage.getItem('nursing_openai_key') || '';
    
    try {
        let url = '/api/questions';
        const params = new URLSearchParams();
        if (category !== 'all') {
            params.set('category', category);
        }
        params.set('count', String(count));
        if (apiKey) {
            params.set('api_key', apiKey);
        }
        url += `?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        
        quizQuestions = data;
        currentQuizIndex = 0;
        quizScoreCount = 0;
        
        document.getElementById('assessment-q-index').textContent = `Question 1 of ${quizQuestions.length}`;
        renderQuizQuestion();
        startQuestionTimer();
    } catch (err) {
        console.error(err);
        // Fallback to local mock questions if API offline
        quizQuestions = [
            {
                category: "Safe and Effective Care Environment",
                question: "A nurse is preparing to delegate tasks to an unlicensed assistive personnel (UAP). Which task is most appropriate for the nurse to delegate?",
                options: [
                    "Performing an admission skin assessment on a new patient.",
                    "Administering a scheduled oral medication to a stable patient.",
                    "Assisting a stable patient with ambulating in the hallway.",
                    "Providing discharge teaching to a patient going home."
                ],
                correctIndex: 2,
                rationale: "Ambulating a stable patient is within the scope of a UAP. Assessments, teaching, and medication administration require clinical judgment and must be performed by licensed nursing staff."
            },
            {
                category: "Pharmacological and Parenteral Therapies",
                question: "A patient is receiving an intravenous infusion of heparin. Which laboratory value should the nurse monitor to adjust the heparin infusion rate?",
                options: [
                    "Prothrombin time (PT)",
                    "Activated partial thromboplastin time (aPTT)",
                    "International normalized ratio (INR)",
                    "Platelet count"
                ],
                correctIndex: 1,
                rationale: "Activated partial thromboplastin time (aPTT) is used to monitor heparin efficacy and guide dose titrations. PT/INR is used to monitor warfarin therapy."
            },
            {
                category: "Physiological Adaptation",
                question: "A patient with a history of heart failure presents with shortness of breath, lung crackles, and jugular venous distention. Which medication is the priority to administer?",
                options: [
                    "Atenolol",
                    "Furosemide",
                    "Lisinopril",
                    "Spironolactone"
                ],
                correctIndex: 1,
                rationale: "The patient is experiencing fluid volume overload (crackles, JVD). Furosemide, a loop diuretic, is the priority drug to rapidly promote fluid excretion and reduce pulmonary congestion."
            },
            {
                category: "Reduction of Risk Potential",
                question: "A nurse is caring for a patient post-op day 1 abdominal surgery. Which intervention is most effective for preventing deep vein thrombosis (DVT)?",
                options: [
                    "Massaging the patient's calves twice daily.",
                    "Encouraging early and frequent ambulation.",
                    "Keeping the patient's knees in a flexed position.",
                    "Limiting fluid intake to 1000 mL per day."
                ],
                correctIndex: 1,
                rationale: "Early ambulation is the single most effective intervention to promote venous return and prevent venous stasis/DVT. Calf massage and knee flexion are contraindicated."
            },
            {
                category: "Leadership & Delegation",
                question: "A nurse is delegating care tasks for a shift. Which client should be assigned to the most experienced nurse on the unit?",
                options: [
                    "A client undergoing a routine postoperative recovery who is stable.",
                    "A client with chronic COPD receiving continuous oxygen at 2 L/min.",
                    "A client newly diagnosed with type 1 diabetes requiring insulin teaching.",
                    "A client admitted 2 hours ago with crushing chest pain and ST-segment elevation."
                ],
                correctIndex: 3,
                rationale: "Crushing chest pain and ST elevation indicates acute MI. This client is hemodynamically unstable and requires advanced assessment and rapid intervention by the most experienced RN."
            }
        ];
        currentQuizIndex = 0;
        quizScoreCount = 0;
        document.getElementById('assessment-q-index').textContent = `Question 1 of ${quizQuestions.length}`;
        renderQuizQuestion();
        startQuestionTimer();
    }
}

function renderQuizQuestion() {
    const categoryEl = document.getElementById('assessment-q-category');
    const textEl = document.getElementById('assessment-q-text');
    const optionsDiv = document.getElementById('assessment-options-container');
    const btnSubmit = document.getElementById('btn-submit-assessment');
    
    btnSubmit.disabled = true;
    
    if (quizQuestions.length === 0) {
        textEl.textContent = 'No questions available.';
        optionsDiv.innerHTML = '';
        return;
    }
    
    const q = quizQuestions[currentQuizIndex];
    categoryEl.textContent = q.category;
    textEl.textContent = q.question;
    optionsDiv.innerHTML = '';
    selectedOptionIndex = null;
    
    q.options.forEach((opt, idx) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'quiz-option';
        optionDiv.innerHTML = `
            <div class="option-checkbox">${String.fromCharCode(65 + idx)}</div>
            <div class="option-content">${opt}</div>
        `;
        optionDiv.onclick = () => {
            document.querySelectorAll('.quiz-option').forEach(el => el.classList.remove('selected'));
            optionDiv.classList.add('selected');
            selectedOptionIndex = idx;
            btnSubmit.disabled = false;
        };
        optionsDiv.appendChild(optionDiv);
    });
}

function submitAssessmentAnswer() {
    if (selectedOptionIndex === null) return;
    
    clearInterval(assessmentTimerInterval);
    const q = quizQuestions[currentQuizIndex];
    const optionsDiv = document.getElementById('assessment-options-container');
    const optionEls = optionsDiv.querySelectorAll('.quiz-option');
    const btnSubmit = document.getElementById('btn-submit-assessment');
    
    optionEls.forEach(el => {
        el.onclick = null;
        el.style.cursor = 'default';
    });
    
    const isCorrect = selectedOptionIndex === q.correctIndex;
    if (isCorrect) {
        quizScoreCount++;
    }
    
    optionEls.forEach((el, idx) => {
        if (idx === q.correctIndex) {
            el.classList.add('correct');
        } else if (idx === selectedOptionIndex) {
            el.classList.add('incorrect');
        }
    });

    // Create rationale explanation display inside active view
    let rationaleBox = document.getElementById('assessment-rationale-box');
    if (!rationaleBox) {
        rationaleBox = document.createElement('div');
        rationaleBox.id = 'assessment-rationale-box';
        rationaleBox.className = 'med-calc-box';
        rationaleBox.style.marginTop = '1.5rem';
        btnSubmit.parentNode.insertBefore(rationaleBox, btnSubmit);
    }
    rationaleBox.style.display = 'block';
    rationaleBox.innerHTML = `<strong>Rationale:</strong><br><br>${q.rationale}`;
    
    btnSubmit.textContent = currentQuizIndex === quizQuestions.length - 1 ? 'Finish Assessment' : 'Next Question';
    btnSubmit.onclick = loadNextNclexQuestion;
}

function loadNextNclexQuestion() {
    // Hide rationale box
    const rationaleBox = document.getElementById('assessment-rationale-box');
    if (rationaleBox) rationaleBox.style.display = 'none';

    const btnSubmit = document.getElementById('btn-submit-assessment');
    btnSubmit.textContent = 'Confirm Answer & Continue';
    btnSubmit.onclick = submitAssessmentAnswer;

    if (currentQuizIndex < quizQuestions.length - 1) {
        currentQuizIndex++;
        document.getElementById('assessment-q-index').textContent = `Question ${currentQuizIndex + 1} of ${quizQuestions.length}`;
        renderQuizQuestion();
        startQuestionTimer();
    } else {
        const scorePct = Math.round((quizScoreCount / quizQuestions.length) * 100);
        
        let history = JSON.parse(localStorage.getItem('nclex_score_history') || '[75, 78, 80, 82]');
        history.push(scorePct);
        localStorage.setItem('nclex_score_history', JSON.stringify(history));
        
        showSkillIQResults(scorePct);
    }
}

function startQuestionTimer() {
    clearInterval(assessmentTimerInterval);
    assessmentTimeLeft = 60;
    
    const timerFill = document.getElementById('assessment-timer-bar');
    const timerLbl = document.getElementById('assessment-timer');
    
    if (timerFill) timerFill.style.width = '100%';
    if (timerLbl) timerLbl.textContent = '60s';
    
    assessmentTimerInterval = setInterval(() => {
        assessmentTimeLeft--;
        if (timerLbl) timerLbl.textContent = `${assessmentTimeLeft}s`;
        if (timerFill) {
            const pct = (assessmentTimeLeft / 60) * 100;
            timerFill.style.width = `${pct}%`;
        }
        
        if (assessmentTimeLeft <= 0) {
            clearInterval(assessmentTimerInterval);
            handleQuestionTimeout();
        }
    }, 1000);
}

function handleQuestionTimeout() {
    alert("⏰ Time is up for this question!");
    if (selectedOptionIndex === null) {
        selectedOptionIndex = 0; // fallback select first
    }
    submitAssessmentAnswer();
}

function showSkillIQResults(scorePct) {
    clearInterval(assessmentTimerInterval);
    
    document.getElementById('skill-iq-welcome-view').style.display = 'none';
    document.getElementById('skill-iq-active-view').style.display = 'none';
    document.getElementById('skill-iq-results-view').style.display = 'flex';
    
    let skillIqVal = 185; 
    if (scorePct === 100) skillIqVal = 285;
    else if (scorePct >= 80) skillIqVal = 230;
    else if (scorePct >= 60) skillIqVal = 175;
    else if (scorePct >= 40) skillIqVal = 120;
    else if (scorePct >= 20) skillIqVal = 65;
    else skillIqVal = 25;
    
    let rating = 'Proficient';
    let ratingClass = 'proficient';
    let strokeColor = '#8338ec'; 
    let percentile = 82;
    let description = '';
    
    if (skillIqVal >= 200) {
        rating = 'Expert';
        ratingClass = 'expert';
        strokeColor = '#00f5d4'; 
        percentile = Math.round(90 + (skillIqVal - 200) / 10);
        description = `You scored higher than ${percentile}% of nursing students in Cohort A. This score demonstrates superior clinical judgment, excellent pharmacology safety management, and rapid priority decision skills. You are highly ready for clinical placement.`;
    } else if (skillIqVal >= 100) {
        rating = 'Proficient';
        ratingClass = 'proficient';
        strokeColor = '#c084fc'; 
        percentile = Math.round(50 + (skillIqVal - 100) * 0.4);
        description = `You scored higher than ${percentile}% of nursing students in Cohort A. This score demonstrates solid foundational competency, ready safe practice skills, and good patient safety management. Focus on pharmacology to reach the Expert level.`;
    } else {
        rating = 'Novice';
        ratingClass = 'novice';
        strokeColor = '#64748b'; 
        percentile = Math.round(10 + skillIqVal * 0.4);
        description = `You scored higher than ${percentile}% of nursing students in Cohort A. This score suggests opportunities for improvement in delegation, critical care, and safety guidelines. We recommend revising the core learning paths before re-assessing.`;
    }
    
    document.getElementById('results-score-val').textContent = skillIqVal;
    
    const pill = document.getElementById('results-rating-level');
    if (pill) {
        pill.textContent = rating;
        pill.className = `rating-level-pill ${ratingClass}`;
    }
    
    const header = document.getElementById('results-title-header');
    if (header) header.textContent = `Your Skill IQ is ${rating}`;
    
    const desc = document.getElementById('results-percentile-desc');
    if (desc) desc.textContent = description;
    
    const circle = document.getElementById('results-score-circle');
    if (circle) {
        circle.style.stroke = strokeColor;
        const circumference = 2 * Math.PI * 50; 
        const offset = circumference * (1 - (skillIqVal / 300));
        circle.style.strokeDashoffset = offset;
    }
    
    const tableBody = document.getElementById('results-subskills-body');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td>Safe Care Environment</td>
                <td class="${scorePct >= 80 ? 'level-high' : 'level-med'}">${scorePct >= 80 ? 'Expert' : 'Proficient'}</td>
            </tr>
            <tr>
                <td>Pharmacological Therapies</td>
                <td class="${scorePct >= 60 ? 'level-med' : 'level-low'}">${scorePct >= 60 ? 'Proficient' : 'Novice'}</td>
            </tr>
            <tr>
                <td>Physiological Adaptation</td>
                <td class="${scorePct >= 100 ? 'level-high' : 'level-med'}">${scorePct >= 100 ? 'Expert' : 'Proficient'}</td>
            </tr>
            <tr>
                <td>Clinical Judgment Speed</td>
                <td class="${assessmentTimeLeft > 30 ? 'level-high' : 'level-med'}">${assessmentTimeLeft > 30 ? 'High' : 'Medium'}</td>
            </tr>
        `;
    }
    
    localStorage.setItem('nursing_skill_iq_score', String(skillIqVal));
    localStorage.setItem('nursing_skill_iq_rating', rating);
    
    // Save Skill IQ completed memory to MCP bridge
    const mcpBridgeUrl = localStorage.getItem('nursing_mcp_bridge_url');
    if (mcpBridgeUrl) {
        const summary = `Student completed adaptive Skill IQ test. Score: ${skillIqVal} (${rating} level). Percentile: ${percentile}%.`;
        fetch(mcpBridgeUrl.split('?')[0] + '/memory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'skill_iq_result', value: summary, summary: summary })
        }).catch(err => console.error('Failed to sync assessment to MCP:', err));
    }
}

function resetSkillIQAssessment() {
    clearInterval(assessmentTimerInterval);
    document.getElementById('skill-iq-welcome-view').style.display = 'block';
    
    const activeView = document.getElementById('skill-iq-active-view');
    if (activeView) activeView.style.display = 'none';
    
    const resultsView = document.getElementById('skill-iq-results-view');
    if (resultsView) resultsView.style.display = 'none';
}
