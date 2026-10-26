# AI Email & Message Writer

A beginner-friendly full-stack project with:
- Frontend: React + TypeScript + Vite
- Backend: FastAPI
- Optional real AI: OpenAI API (key stays on the backend)
- Demo mode: works without an API key using a simple template response

## Project structure

```text
ai-email-message-writer/
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── style.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/
│   ├── app/
│   │   └── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
└── .gitignore
```

## Run locally

### 1. Backend
From the `backend` directory:

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env`. Add your API key if you want real AI generation.
Then run:

```bash
uvicorn app.main:app --reload
```

Backend URL: `http://127.0.0.1:8000`
Health check: `http://127.0.0.1:8000/api/health`

### 2. Frontend
In another terminal, from the `frontend` directory:

```bash
npm install
npm run dev
```

Vite normally shows a local URL such as `http://localhost:5173`.

## Do I need an API key?

- **For genuine AI-written messages:** yes, connect an AI provider and configure its API key on the backend.
- **Without a key:** this project uses a clearly labelled demo/template mode. It does not call a real AI model.
- Never put API keys in frontend code or commit a `.env` file to GitHub.

## Deploying

- Deploy `frontend/` as a Vite app on a frontend host such as Vercel.
- Deploy `backend/` as a Python web service on a host such as Render.
- Set the backend environment variable `OPENAI_API_KEY` in the backend host's dashboard (if using real AI).
- Set `FRONTEND_ORIGIN` to your deployed frontend URL, and set frontend `VITE_API_URL` to the deployed backend URL.
- Redeploy after setting environment variables.
