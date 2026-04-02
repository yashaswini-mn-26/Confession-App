// src/pages/Explore.jsx
// Main feed: real-time confessions, tag filter stories, compose box, load more.

import { useState, useMemo } from "react";
import { db } from "../lib/firebase";
import {
  collection, addDoc, serverTimestamp
} from "firebase/firestore";
import { useConfessions }  from "../hooks/useConfession";
import { useApp }          from "../context/AppContext";
import Navbar   from "../components/Navbar";
import Compose  from "../components/Compose";
import PostCard from "../components/PostCard";

const TAGS = [
  { label: "Longing",    emoji: "💭" },
  { label: "Gratitude",  emoji: "🙏" },
  { label: "First Love", emoji: "🌹" },
  { label: "Heartbreak", emoji: "💔" },
  { label: "Secret",     emoji: "🤫" },
  { label: "Joy",        emoji: "☀️" },
];

function Stories({ active, setActive }) {
  return (
    <div className="stories" role="tablist" aria-label="Filter by mood">
      <button
        role="tab"
        className={`story ${active === "" ? "active" : ""}`}
        onClick={() => setActive("")}
        aria-selected={active === ""}
      >
        <div className="story-icon">🤍</div>
        <span>All</span>
      </button>
      {TAGS.map(t => (
        <button
          key={t.label}
          role="tab"
          className={`story ${active === t.label ? "active" : ""}`}
          onClick={() => setActive(active === t.label ? "" : t.label)}
          aria-selected={active === t.label}
        >
          <div className="story-icon">{t.emoji}</div>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function Explore() {
  const { SESSION_ID, profile } = useApp();
  const { confessions, loading, loadMore, loadingMore, hasMore } = useConfessions();
  const [filter, setFilter] = useState("");
  const [sort,   setSort]   = useState("new");

  const displayed = useMemo(() => {
    return confessions
      .filter(c => !filter || c.tag === filter)
      .sort((a, b) =>
        sort === "top"
          ? (b.likedBy?.length || 0) - (a.likedBy?.length || 0)
          : (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
      );
  }, [confessions, filter, sort]);

  const handlePost = async (text, tag) => {
    await addDoc(collection(db, "confessions"), {
      text,
      tag:          tag || null,
      likedBy:      [],
      comments:     [],
      authorId:     SESSION_ID,
      authorName:   profile?.username || "Anonymous",
      authorAvatar: profile?.avatar   || "🌸",
      createdAt:    serverTimestamp(),
    });
  };

  return (
    <div className="app">
      <Navbar sortValue={sort} onSort={setSort} />

      <main className="main" role="main">
        <Stories active={filter} setActive={setFilter} />
        <Compose onPost={handlePost} />

        <div className="feed" role="feed" aria-busy={loading} aria-label="Confessions feed">
          {loading ? (
            <div className="empty">
              <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
            </div>
          ) : displayed.length === 0 ? (
            <div className="empty">
              <p className="empty-heart">♡</p>
              <p className="empty-text">
                No confessions yet.<br />Be the first to share.
              </p>
            </div>
          ) : (
            <>
              {displayed.map((item, i) => (
                <PostCard key={item.id} item={item} index={i} />
              ))}

              {hasMore && (
                <div style={{ padding: "1.5rem", textAlign: "center" }}>
                  <button
                    className="share-btn ready"
                    onClick={loadMore}
                    disabled={loadingMore}
                    style={{ margin: "0 auto" }}
                  >
                    {loadingMore ? <span className="spinner" /> : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>Every word is anonymous · Shared with love</p>
      </footer>
    </div>
  );
}