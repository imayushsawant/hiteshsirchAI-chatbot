import { useState, useRef, useEffect, useCallback } from "react";
import OpenAI from "openai";
import "./App.css";

/* ─── Avatar imports ─── */
import hiteshNormal from "./assets/hitesh-normal.png";
import hiteshThinking from "./assets/hitesh-thinking.png";
import hiteshHover from "./assets/hitesh-hover.png";

/* ─── Constants ─── */
const API_KEY = import.meta.env.VITE_API_KEY;

const HITESH_SIR_PROMPT = `You are Hitesh Choudhary, a popular Indian tech educator, content creator, and founder of ChaiCode — both a YouTube channel and a learning platform. You are proudly retired from corporate life, work selectively as a consultant on your own terms, and carry a deeply chill, unhurried energy in everything you do. You have travelled to around 90 countries and that worldliness shows — you are relaxed, grounded, and never stressed about small things. You have 2M+ YouTube subscribers and an active presence on Twitter/X, GitHub, and LinkedIn, with your entire personality built around making programming feel accessible, fun, and achievable for beginners and intermediate developers.

Your tone is energetic and friendly from the first message, conversational and informal, but always backed by official documentation and industry best practices. You say "haanji" naturally as a signature acknowledgment that reflects your desi roots without being forced. Chai is more than a drink for you — it is your brand identity, woven into how you open conversations, name concepts, and build community vibe.

You love using Superman as your go-to example character when explaining programming concepts, whether it is a class, an object, an API call, or a function. Beyond Superman, you use real-world grounded analogies that a beginner can immediately picture. You use light humor, relatable personal anecdotes, and a motivational but never preachy approach, always framing errors and failures as stepping stones rather than setbacks.

When teaching, you always structure your answers clearly — Setup, Concept, Example, Apply — breaking things into digestible steps, repeating key ideas in different ways until they land, and anchoring abstract concepts to real projects like e-commerce apps, CRUD apps, and real-time chat applications. You stay current with the latest stable versions of frameworks like React, Next.js, Tailwind, and Node.js, and you always point learners to official documentation rather than guessing.

Your expertise spans full-stack web development, mobile development with React Native and Flutter, introductory Python and ML, cloud deployment on AWS, GCP and Azure, Docker, CI/CD, Git, DSA for interview prep, freelancing, personal branding, and building SaaS products. You actively promote open-source contribution, building real projects over tutorial-hopping, and living life on your own terms — because the goal was never just to code, it was to be free.

You naturally speak in Hinglish — a relaxed mix of Hindi and English the way most Indian developers actually talk — and your replies should reflect that same energy, switching between Hindi and English fluidly within the same sentence or thought without it feeling forced. Keep replies chill and conversational, never stiff or overly formal.

The Superman analogy is your thing but use it sparingly and only when it genuinely makes a concept clearer — do not force it into every explanation or it loses its charm. When it fits, it lands well; when it does not, just teach straightforward without it.

Your goal is to make programming feel like a superpower that anyone can learn, not some elite skill reserved for a few. Always end your replies with a motivational note that encourages learners to keep going, embrace the journey, and remember that every expert was once a beginner.

Keep your replies relatively short and focus more on offering perspective rather than providing strict, step-by-step career roadmaps. For example, if someone asks whether they should focus on DSA or Development, your attitude is that DSA is just an essential thing you are meant to do (no big deal), while development should be something you genuinely enjoy exploring.

Haanji, let's get started!`;

const SUGGESTION_PROMPTS = [
  "Should I learn React or Next.js first?",
  "DSA or Development kya karu?",
  "How to start freelancing?",
  "Best projects for my resume?",
];

/* ─── Idle avatar images to shuffle between ─── */
const IDLE_AVATARS = [hiteshNormal, hiteshHover];

/* ─── Groq Client ─── */
function createGroqClient() {
  if (!API_KEY) {
    console.error("VITE_API_KEY is missing. Add it to your .env file.");
    return null;
  }
  return new OpenAI({
    apiKey: API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
    dangerouslyAllowBrowser: true,
  });
}

/* ─── Helpers ─── */
function formatTime(date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ─── SVG Icons ─── */
function SendIcon() {
  return (
    <svg className="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/* ─── Avatar Component with random shuffle ─── */
function HiteshAvatar({ isThinking = false, size = "small", className = "" }) {
  const [idleAvatar, setIdleAvatar] = useState(() => pickRandom(IDLE_AVATARS));

  /* Shuffle idle avatar every 4 seconds */
  useEffect(() => {
    if (isThinking) return;
    const interval = setInterval(() => {
      setIdleAvatar(pickRandom(IDLE_AVATARS));
    }, 4000);
    return () => clearInterval(interval);
  }, [isThinking]);

  /* On hover, immediately shuffle */
  const handleHover = () => {
    if (!isThinking) {
      setIdleAvatar(pickRandom(IDLE_AVATARS));
    }
  };

  const src = isThinking ? hiteshThinking : idleAvatar;
  const sizeClass = size === "large" ? "welcome-avatar" : "message-avatar";
  const thinkingClass = isThinking ? "thinking" : "";

  return (
    <div
      className={`${sizeClass} ${thinkingClass} ${className}`}
      onMouseEnter={handleHover}
    >
      <img src={src} alt="Hitesh Sir" />
    </div>
  );
}

/* ═══════════════════════════════════
   App Component
   ═══════════════════════════════════ */
function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const clientRef = useRef(null);

  /* Initialize Groq client */
  useEffect(() => {
    clientRef.current = createGroqClient();
  }, []);

  /* Apply dark mode class */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  /* Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Auto-resize textarea */
  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  }, []);

  /* ─── Send message with streaming ─── */
  const sendMessage = useCallback(
    async (overrideText) => {
      const text = (overrideText ?? input).trim();
      if (!text || isStreaming) return;

      if (!clientRef.current) {
        setError("API key not configured. Add VITE_API_KEY to your .env file.");
        return;
      }

      setError(null);
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";

      const userMessage = { role: "user", content: text, timestamp: new Date() };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsStreaming(true);

      const assistantMessage = { role: "assistant", content: "", timestamp: new Date() };
      setMessages([...updatedMessages, assistantMessage]);

      /* Thinking delay */
      await new Promise((r) => setTimeout(r, 1500));

      try {
        const apiMessages = [
          { role: "system", content: HITESH_SIR_PROMPT },
          ...updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        ];

        const stream = await clientRef.current.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: apiMessages,
          stream: true,
        });

        let accumulated = "";

        for await (const chunk of stream) {
          const delta = chunk.choices?.[0]?.delta?.content ?? "";
          if (delta) {
            accumulated += delta;
            await new Promise((r) => setTimeout(r, 30));
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === "assistant") {
                updated[updated.length - 1] = { ...last, content: accumulated };
              }
              return updated;
            });
          }
        }
      } catch (err) {
        console.error("Stream error:", err);
        setError(err.message || "Something went wrong. Please try again.");
        setMessages((prev) => {
          if (prev.length > 0 && prev[prev.length - 1].role === "assistant" && prev[prev.length - 1].content === "") {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [input, isStreaming, messages]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const handleSuggestion = useCallback(
    (text) => sendMessage(text),
    [sendMessage]
  );

  /* ─── Render ─── */
  return (
    <div className="chat-app">
      {/* ── Header ── */}
      <header className="chat-header" id="chat-header">
        <div className="header-left">
          <HiteshAvatar isThinking={isStreaming} size="small" className="header-avatar" />
          <div className="header-info">
            <h1>Hitesh Choudhary AI ☕</h1>
            <div className="header-status">
              <span className={`status-dot ${isStreaming ? "thinking" : ""}`} />
              <span>{isStreaming ? "Typing..." : "Online"}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <button
            className="theme-toggle"
            id="theme-toggle"
            onClick={() => setDarkMode((d) => !d)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      {/* ── Messages ── */}
      <main className="messages-area" id="messages-area">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-screen" id="welcome-screen">
              <div className="welcome-avatar-wrap">
                <div className="welcome-glow" />
                <HiteshAvatar size="large" />
              </div>
              <p className="welcome-brand">Powered by <span>ChaiCode</span></p>
              <h2 className="welcome-title">
                Haanji! <span className="accent">Chai peelo</span> ☕
              </h2>
              <p className="welcome-subtitle">
                Ask me anything about web dev, DSA, career, freelancing or just life. Let's make coding fun, one sip at a time.
              </p>
              <div className="welcome-suggestions" id="suggestions">
                {SUGGESTION_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    className="suggestion-chip"
                    id={`suggestion-${i}`}
                    onClick={() => handleSuggestion(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.role}`} id={`message-${i}`}>
                {msg.role === "assistant" && (
                  <HiteshAvatar isThinking={isStreaming && i === messages.length - 1} />
                )}
                <div className="message-content">
                  <div className="message-bubble">
                    {msg.role === "assistant" && isStreaming && i === messages.length - 1 && msg.content === "" ? (
                      <div className="thinking-indicator">
                        <div className="thinking-dots">
                          <span /><span /><span />
                        </div>
                        <span className="thinking-text">Hitesh sir soch rahe hain...</span>
                      </div>
                    ) : (
                      <>
                        {msg.content}
                        {isStreaming && msg.role === "assistant" && i === messages.length - 1 && (
                          <span className="streaming-cursor" />
                        )}
                      </>
                    )}
                  </div>
                  <div className="message-time">
                    {msg.timestamp && formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}

          {error && (
            <div className="error-message" id="error-message">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* ── Input ── */}
      <footer className="input-area" id="input-area">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            id="chat-input"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Kuch bhi poochho..."
            rows={1}
            disabled={isStreaming}
          />
          <button
            className="send-button"
            id="send-button"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isStreaming}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
