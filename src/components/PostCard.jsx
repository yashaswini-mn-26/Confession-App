// src/components/PostCard.jsx
// Full post card with:
// - Optimistic like toggle (instant UI, async Firestore update)
// - Notification write on like/comment (triggers Alerts for post author)
// - Comment expand/collapse
// - Accessible action buttons

import { useState, useRef } from "react";
import { db } from "../lib/firebase";
import {
  doc, updateDoc, addDoc,
  arrayUnion, arrayRemove,
  collection, serverTimestamp
} from "firebase/firestore";
import Avatar from "./Avatar";
import { timeAgo } from "../lib/timeAgo";
import { useApp } from "../context/AppContext";

const TAGS = [
  { label: "Longing",    emoji: "💭" },
  { label: "Gratitude",  emoji: "🙏" },
  { label: "First Love", emoji: "🌹" },
  { label: "Heartbreak", emoji: "💔" },
  { label: "Secret",     emoji: "🤫" },
  { label: "Joy",        emoji: "☀️" },
];

// Write a notification to the post author (if they're not the actor)
async function writeNotification({ type, authorId, actorId, postId, text = null }) {
  // Skip if authorId is missing (legacy posts) or if acting on your own post
  if (!authorId || authorId === actorId) return;
  await addDoc(collection(db, "notifications"), {
    userId:    authorId,
    type,
    postId,
    text:      text ?? null,   // ensure never undefined
    seen:      false,
    createdAt: serverTimestamp(),
  });
}

export default function PostCard({ item, index = 0 }) {
  const { SESSION_ID, profile } = useApp();
  const alreadyLiked = (item.likedBy || []).includes(SESSION_ID);

  const [liked,    setLiked]    = useState(alreadyLiked);
  const [likeAnim, setLikeAnim] = useState(false);
  const [showCmt,  setShowCmt]  = useState(false);
  const [cmtText,  setCmtText]  = useState("");
  const [posting,  setPosting]  = useState(false);
  const inputRef = useRef(null);

  const likeCount = (item.likedBy || []).length;
  const cmtCount  = (item.comments || []).length;
  const tag       = item.tag ? TAGS.find(t => t.label === item.tag) : null;

  // ── Like / unlike ──────────────────────────────────────────────
  const handleLike = async () => {
    const postRef = doc(db, "confessions", item.id);
    if (liked) {
      setLiked(false);
      await updateDoc(postRef, { likedBy: arrayRemove(SESSION_ID) });
    } else {
      setLiked(true);
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 700);
      await updateDoc(postRef, { likedBy: arrayUnion(SESSION_ID) });
      writeNotification({
        type: "like", authorId: item.authorId,
        actorId: SESSION_ID, postId: item.id
      });
    }
  };

  // ── Comment ────────────────────────────────────────────────────
  const handleComment = async () => {
    if (!cmtText.trim() || posting) return;
    setPosting(true);
    const payload = {
      text:      cmtText.trim(),
      authorId:  SESSION_ID,
      avatar:    profile?.avatar || "🌸",
      createdAt: new Date().toISOString(),
    };
    const prev = cmtText;
    setCmtText("");
    try {
      await updateDoc(doc(db, "confessions", item.id), {
        comments: arrayUnion(payload)
      });
      writeNotification({
        type: "comment", authorId: item.authorId,
        actorId: SESSION_ID, postId: item.id, text: prev.trim()
      });
    } catch {
      setCmtText(prev); // restore on failure
    } finally {
      setPosting(false);
    }
  };

  return (
    <article
      className="post-card"
      style={{ animationDelay: `${Math.min(index * 0.06, 0.48)}s` }}
    >
      {/* Header */}
      <div className="post-header">
        <Avatar emoji={item.authorAvatar} size={40} />
        <div className="post-meta">
          <span className="post-author">{item.authorName || "Anonymous"}</span>
          <span className="post-time">{timeAgo(item.createdAt)} ago</span>
        </div>
        {tag && (
          <span className="post-tag" aria-label={`Tagged: ${tag.label}`}>
            {tag.emoji} {tag.label}
          </span>
        )}
      </div>

      {/* Body */}
      <p className="post-text">{item.text}</p>

      {/* Actions */}
      <div className="action-bar">
        <div className="action-left">
          <button
            className={`act-btn ${liked ? "liked" : ""}`}
            onClick={handleLike}
            aria-label={liked ? "Unlike" : "Like"}
            aria-pressed={liked}
          >
            <svg
              className={likeAnim ? "heart-pop" : ""}
              viewBox="0 0 24 24"
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button
            className="act-btn"
            onClick={() => {
              setShowCmt(v => !v);
              setTimeout(() => inputRef.current?.focus(), 80);
            }}
            aria-label="Comment"
            aria-expanded={showCmt}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
        <button className="act-btn" aria-label="Save">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

      {/* Like count */}
      {likeCount > 0 && (
        <p className="likes-line">
          {likeCount} {likeCount === 1 ? "heart" : "hearts"}
        </p>
      )}

      {/* Comment toggle */}
      {cmtCount > 0 && !showCmt && (
        <button className="view-comments" onClick={() => setShowCmt(true)}>
          View {cmtCount === 1 ? "1 comment" : `all ${cmtCount} comments`}
        </button>
      )}

      {/* Comments section */}
      {showCmt && (
        <div className="comments-block">
          {cmtCount === 0 && (
            <p className="no-cmt">Be the first to respond ♡</p>
          )}
          {(item.comments || []).map((c, i) => (
            <div key={i} className="comment-row">
              <Avatar emoji={c.avatar} size={26} />
              <div className="comment-bubble">
                <p className="comment-text">{c.text}</p>
              </div>
              <span className="comment-time">
                {timeAgo({ toMillis: () => new Date(c.createdAt).getTime() })}
              </span>
            </div>
          ))}
          <div className="cmt-input-row">
            <Avatar emoji={profile?.avatar} size={28} />
            <input
              ref={inputRef}
              value={cmtText}
              onChange={e => setCmtText(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") { e.preventDefault(); handleComment(); }
              }}
              placeholder="Add a comment…"
              className="cmt-input"
              maxLength={200}
              aria-label="Write a comment"
            />
            {cmtText.trim() && (
              <button className="cmt-post-btn" onClick={handleComment} disabled={posting}>
                {posting ? "…" : "Post"}
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}