// src/components/Compose.jsx
// Inline compose box for the Explore feed.
// Handles character limit, tag selection, and calls onPost callback.

import { useState } from "react";
import Avatar from "./Avatar";
import { useApp } from "../context/AppContext";

const MAX_CHARS = 280;
const TAGS = [
  { label: "Longing",    emoji: "💭" },
  { label: "Gratitude",  emoji: "🙏" },
  { label: "First Love", emoji: "🌹" },
  { label: "Heartbreak", emoji: "💔" },
  { label: "Secret",     emoji: "🤫" },
  { label: "Joy",        emoji: "☀️" },
];

export default function Compose({ onPost }) {
  const { profile } = useApp();
  const [text,    setText]    = useState("");
  const [tag,     setTag]     = useState("");
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);

  const remaining = MAX_CHARS - text.length;

  const handleShare = async () => {
    if (!text.trim() || remaining < 0) return;
    setLoading(true);
    await onPost(text.trim(), tag);
    setText(""); setTag(""); setOpen(false);
    setLoading(false);
  };

  const handleCancel = () => {
    setOpen(false); setText(""); setTag("");
  };

  return (
    <div className={`compose ${open ? "open" : ""}`}>
      <div className="compose-top">
        <Avatar emoji={profile?.avatar} size={40} />
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Share something from the heart…"
          className="compose-ta"
          rows={open ? 4 : 1}
          aria-label="Write a confession"
          maxLength={MAX_CHARS + 20}
        />
      </div>

      {open && (
        <>
          <div className="tag-grid">
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

          <div className="compose-footer">
            <div className="progress-ring-wrap" aria-label={`${remaining} characters remaining`}>
              <svg className="progress-ring" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="12" fill="none" stroke="var(--petal-border)" strokeWidth="3"/>
                <circle
                  cx="16" cy="16" r="12" fill="none"
                  stroke={remaining < 0 ? "var(--warn)" : remaining < 40 ? "var(--rose-mid)" : "var(--rose)"}
                  strokeWidth="3"
                  strokeDasharray={`${Math.min((text.length / MAX_CHARS) * 75.4, 75.4)} 75.4`}
                  strokeLinecap="round"
                  transform="rotate(-90 16 16)"
                />
              </svg>
              {remaining <= 40 && (
                <span className={`ring-num ${remaining < 0 ? "over" : ""}`}>{remaining}</span>
              )}
            </div>

            <div className="compose-btns">
              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
              <button
                className={`share-btn ${text.trim() && remaining >= 0 ? "ready" : ""}`}
                onClick={handleShare}
                disabled={!text.trim() || remaining < 0 || loading}
                aria-label="Share confession"
              >
                {loading ? <span className="spinner" aria-hidden="true"/> : "Share"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}