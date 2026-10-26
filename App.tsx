import { useState } from "react";

const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

type FormState = {
  message: string;
  kind: "Email" | "Text message" | "Professional DM";
  tone: string;
  audience: string;
  language: string;
  length: string;
};

export default function App() {
  const [form, setForm] = useState<FormState>({
    message: "",
    kind: "Email",
    tone: "Friendly and professional",
    audience: "",
    language: "English",
    length: "Medium"
  });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function generate() {
    if (!form.message.trim()) {
      setError("Pehle apna idea ya rough message likho.");
      return;
    }
    setLoading(true);
    setError("");
    setResult("");
    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Message generate nahi hua.");
      setResult(data.text);
      setMode(data.mode === "ai" ? "AI generated" : "Demo mode — real AI API key configured nahi hai");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Backend se connect nahi ho paaya. Backend URL check karo.");
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(result);
      setMode((old) => `${old} • Copied`);
    } catch {
      setError("Copy nahi ho paaya. Text ko manually select karke copy karo.");
    }
  }

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand-mark">✉</div>
        <div>
          <p className="eyebrow">WRITE WITH CLARITY</p>
          <h1>AI Email & Message Writer</h1>
        </div>
        <span className="pill">Beta</span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">YOUR THOUGHTS, BETTER WORDS</p>
          <h2>Say it clearly.<br /><span>Send it confidently.</span></h2>
          <p className="subhead">Turn rough ideas into thoughtful emails and messages in seconds.</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-paper"><span>✦</span><i></i><i></i><i></i><b>✉</b></div>
        </div>
      </section>

      <section className="workspace">
        <div className="panel form-panel">
          <div className="section-heading">
            <div><p className="eyebrow">STEP 01</p><h3>What do you want to say?</h3></div>
            <span className="step">01 / 02</span>
          </div>
          <label htmlFor="message">Your rough idea or draft</label>
          <textarea id="message" rows={6} placeholder="Example: Ask my teacher for an extension because I need one more day..." value={form.message} onChange={(e) => update("message", e.target.value)} />
          <div className="field-grid">
            <div>
              <label htmlFor="kind">Message type</label>
              <select id="kind" value={form.kind} onChange={(e) => update("kind", e.target.value as FormState["kind"])}>
                <option>Email</option><option>Text message</option><option>Professional DM</option>
              </select>
            </div>
            <div>
              <label htmlFor="tone">Tone</label>
              <select id="tone" value={form.tone} onChange={(e) => update("tone", e.target.value)}>
                <option>Friendly and professional</option><option>Formal</option><option>Warm</option><option>Confident</option><option>Apologetic</option><option>Short and direct</option>
              </select>
            </div>
            <div>
              <label htmlFor="audience">Who is it for? (optional)</label>
              <input id="audience" placeholder="e.g. teacher, manager, friend" value={form.audience} onChange={(e) => update("audience", e.target.value)} />
            </div>
            <div>
              <label htmlFor="language">Language</label>
              <select id="language" value={form.language} onChange={(e) => update("language", e.target.value)}>
                <option>English</option><option>Hindi</option><option>Hinglish</option><option>Spanish</option><option>French</option>
              </select>
            </div>
            <div>
              <label htmlFor="length">Length</label>
              <select id="length" value={form.length} onChange={(e) => update("length", e.target.value)}>
                <option>Short</option><option>Medium</option><option>Detailed</option>
              </select>
            </div>
          </div>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="primary-btn" onClick={generate} disabled={loading}>
            {loading ? "Writing your message…" : "✦  Generate message"}
          </button>
          <p className="privacy-note">Tip: Avoid entering passwords or private information.</p>
        </div>

        <div className="panel result-panel">
          <div className="section-heading">
            <div><p className="eyebrow">STEP 02</p><h3>Your polished message</h3></div>
            <span className="sparkle">✦</span>
          </div>
          {result ? (
            <>
              <div className="result-meta">{mode}</div>
              <pre className="result-text">{result}</pre>
              <button className="secondary-btn" onClick={copyResult}>Copy message</button>
            </>
          ) : (
            <div className="empty-result">
              <div className="empty-icon">✉</div>
              <h4>Your message will appear here</h4>
              <p>Enter your idea, choose a tone, and generate a polished draft.</p>
              <div className="sample-line"></div><div className="sample-line short"></div><div className="sample-line"></div>
            </div>
          )}
        </div>
      </section>
      <footer>Made to help you communicate thoughtfully. Always review before sending.</footer>
    </main>
  );
}
