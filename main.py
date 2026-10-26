import os
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI(title="AI Email & Message Writer API", version="1.0.0")

def allowed_origins() -> list[str]:
    raw = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

class GenerateRequest(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    kind: Literal["Email", "Text message", "Professional DM"] = "Email"
    tone: str = Field(default="Friendly and professional", max_length=80)
    audience: str = Field(default="", max_length=160)
    language: str = Field(default="English", max_length=40)
    length: Literal["Short", "Medium", "Detailed"] = "Medium"

class GenerateResponse(BaseModel):
    text: str
    mode: Literal["ai", "demo"]

def demo_response(req: GenerateRequest) -> str:
    greeting = {
        "Email": "Hello,",
        "Text message": "",
        "Professional DM": "Hi,",
    }[req.kind]
    signoff = "\n\nBest regards," if req.kind == "Email" else ""
    audience = f" for {req.audience}" if req.audience.strip() else ""
    tone_note = req.tone.lower()
    if req.length == "Short":
        body = f"I wanted to reach out{audience}. {req.message.strip()}"
    elif req.length == "Detailed":
        body = (
            f"I’m reaching out{audience} regarding the following: "
            f"{req.message.strip()}\n\n"
            "Please let me know if you need any additional details. "
            "Thank you for your time and consideration."
        )
    else:
        body = f"I wanted to reach out{audience}. {req.message.strip()}\n\nThank you for your time."
    if req.language.lower() in ("hindi", "hinglish"):
        body = f"Main aapse {req.audience or 'is baare mein'} sampark kar raha/rahi hoon. {req.message.strip()}\n\nKripya batayein agar aur jaankari chahiye. Dhanyavaad."
        greeting = "Namaste,"
        signoff = "\n\nDhanyavaad,"
    if req.kind == "Text message":
        greeting = ""
        signoff = ""
    parts = [p for p in [greeting, body, signoff] if p]
    return "\n\n".join(parts) + ("\n[Demo mode: set OPENAI_API_KEY on the backend for real AI generation.]")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ai-email-message-writer"}


@app.post("/api/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Please enter a message idea.")

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        return GenerateResponse(text=demo_response(req), mode="demo")

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        prompt = (
            "You are a careful writing assistant. Rewrite the user's rough idea into a useful "
            "message. Do not invent facts, dates, promises, or personal details. Preserve the "
            "user's intent. Return only the draft, with an appropriate subject line for email "
            "when helpful. Avoid explaining your process.\n\n"
            f"Message type: {req.kind}\nTone: {req.tone}\nAudience: {req.audience or 'not specified'}\n"
            f"Language: {req.language}\nLength: {req.length}\nUser's rough idea:\n{req.message}"
        )
        result = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": "You improve emails and messages clearly and respectfully."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )
        text = result.choices[0].message.content
        if not text:
            raise RuntimeError("The AI provider returned an empty response.")
        return GenerateResponse(text=text.strip(), mode="ai")
    except Exception:
        # Do not expose provider internals, keys, or raw exception details to clients.
        raise HTTPException(
            status_code=502,
            detail="AI provider request failed. Check the backend API key, model setting, and provider account."
        )
