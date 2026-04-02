// src/pages/AddPost.jsx
// Dedicated full-page post creation with character count and tag picker.
// After posting, navigate back to Explore so user can see their post.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useApp }   from "../context/AppContext";
import Navbar       from "../components/Navbar";
import "./AddPost.css";

const MAX_CHARS = 280;
const TAGS = [
  { label: "Longing",    emoji: "💭" },
  { label: "Gratitude",  emoji: "🙏" },
  { label: "First Love", emoji: "🌹" },
  { label: "Heartbreak", emoji: "💔" },
  { label: "Secret",     emoji: "🤫" },
  { label: "Joy",        emoji: "☀️" },
];

export default function AddPost() {
  const navigate = useNavigate();
  const { SESSION_ID, profile } = useApp();

  const [text,    setText]    = useState("");
  const [tag,     setTag]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const remaining = MAX_CHARS - text.length;

  const handlePost = async () => {
    if (!text.trim() || remaining < 0) return;
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, "confessions"), {
        text:         text.trim(),
        tag:          tag || null,
        likedBy:      [],
        comments:     [],
        authorId:     SESSION_ID,
        authorName:   profile?.username || "Anonymous",
        authorAvatar: profile?.avatar   || "🌸",
        createdAt:    serverTimestamp(),
      });
      navigate("/explore");
    } catch {
      setError("Failed to share. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page" style={{ maxWidth: 560, margin: "0 auto", padding: "20px", minHeight: "90vh" }}>

        <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem", color: "var(--text-1)" }}>
          Create a Whisper
        </h3>

        <textarea
          className="compose-ta big"
          placeholder="What's in your heart today…"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
          aria-label="Confession text"
          maxLength={MAX_CHARS + 20}
        />

        <div className="tag-grid" style={{ paddingLeft: 0, marginTop: "0.75rem" }}>
          {TAGS.map(t => (
            <button
              key={t.label}
              className={`tag-pill ${tag === t.label ? "active" : ""}`}
              onClick={() => setTag(tag === t.label ? "" : t.label)}
              aria-pressed={tag === t.label}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        <div className="char-count" aria-live="polite">
          <span style={{ color: remaining < 0 ? "var(--warn)" : remaining < 40 ? "var(--rose-mid)" : "var(--text-3)" }}>
            {remaining} characters left
          </span>
        </div>

        {error && (
          <p style={{ color: "var(--warn)", fontSize: "0.85rem", marginTop: "0.5rem" }}>{error}</p>
        )}

        <button
          className={`share-btn full ${text.trim() && remaining >= 0 ? "ready" : ""}`}
          onClick={handlePost}
          disabled={!text.trim() || remaining < 0 || loading}
          aria-label="Share whisper"
        >
          {loading ? <span className="spinner" /> : "Share Whisper 💫"}
        </button>

      </div>
    </>
  );
}