# Nursing Success AI Tutor

Public-ready FastAPI + static frontend app for clinical simulations, NCLEX prep, AI preceptor chat, and research synthesis.

## Run locally

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Start the app:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

4. Open:
- `http://localhost:8000`
- Health check: `http://localhost:8000/healthz`

## Deploy to Render (recommended)

This repo includes `render.yaml`, so deployment is straightforward.

1. Push this project to GitHub.
2. In Render, click **New +** -> **Blueprint**.
3. Select your GitHub repo.
4. Render reads `render.yaml` and creates the web service.
5. Wait for deploy to finish, then open the generated URL.

### Optional environment variables

- `OPENAI_API_KEY`: enables live OpenAI responses in chat/research.
- `MCP_BRIDGE_URL`: optional bridge endpoint for agentic research context enrichment.
- `CORS_ALLOW_ORIGINS`: comma-separated origins for browser clients.
  - Example: `https://yourdomain.com,https://www.yourdomain.com`

### Local `.env` file

Create a file named `.env` in the project root for local development:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
MCP_BRIDGE_URL=
```

The app loads `.env` at startup and the shared OpenAI helper reads `OPENAI_API_KEY` anytime authentication is needed.

## Notes

- User registration is currently in-memory and resets on service restart.
- Static assets are served from the `static/` folder by FastAPI.
