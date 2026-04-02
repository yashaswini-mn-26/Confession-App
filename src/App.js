// import { useState, useEffect, useRef } from "react";
// import { db } from "./firebase";
// import {
//   collection,
//   addDoc,
//   onSnapshot,
//   updateDoc,
//   doc,
//   orderBy,
//   query,
//   serverTimestamp,
//   arrayUnion,
//   arrayRemove,
// } from "firebase/firestore";
// import "./App.css";

// // ── Utilities ──────────────────────────────────────────────────────
// const timeAgo = (ts) => {
//   if (!ts) return "just now";
//   const sec = Math.floor((Date.now() - ts.toMillis()) / 1000);
//   if (sec < 60) return `${sec}s`;
//   if (sec < 3600) return `${Math.floor(sec / 60)}m`;
//   if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
//   return `${Math.floor(sec / 86400)}d`;
// };

// const MAX_CHARS = 280;
// const SESSION_ID = (() => {
//   let id = sessionStorage.getItem("cw_uid");
//   if (!id) { id = Math.random().toString(36).slice(2); sessionStorage.setItem("cw_uid", id); }
//   return id;
// })();

// const AVATARS = ["🌸", "🌷", "🌹", "💐", "🌺", "🌼", "🍀", "🦋", "🕊️", "✨", "🌙", "💫"];
// const getAvatar = (id) => AVATARS[parseInt(id?.slice(-2) || "0", 36) % AVATARS.length];

// const TAGS = [
//   { label: "Longing",   emoji: "💭" },
//   { label: "Gratitude", emoji: "🙏" },
//   { label: "First Love",emoji: "🌹" },
//   { label: "Heartbreak",emoji: "💔" },
//   { label: "Secret",    emoji: "🤫" },
//   { label: "Joy",       emoji: "☀️" },
// ];

// // ── Avatar ─────────────────────────────────────────────────────────
// function Avatar({ id, size = 40 }) {
//   return (
//     <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.46 }}>
//       {getAvatar(id)}
//     </div>
//   );
// }

// // ── Comment Row ────────────────────────────────────────────────────
// function CommentItem({ comment }) {
//   const ts = { toMillis: () => new Date(comment.createdAt).getTime() };
//   return (
//     <div className="comment-row">
//       <Avatar id={comment.authorId} size={26} />
//       <div className="comment-bubble">
//         <p className="comment-text">{comment.text}</p>
//       </div>
//       <span className="comment-time">{timeAgo(ts)}</span>
//     </div>
//   );
// }

// // ── Post Card ──────────────────────────────────────────────────────
// function PostCard({ item, index }) {
//   const alreadyLiked = (item.likedBy || []).includes(SESSION_ID);
//   const [liked,      setLiked]      = useState(alreadyLiked);
//   const [likeAnim,   setLikeAnim]   = useState(false);
//   const [showCmt,    setShowCmt]    = useState(false);
//   const [cmtText,    setCmtText]    = useState("");
//   const inputRef = useRef(null);

//   const likeCount   = (item.likedBy || []).length;
//   const cmtCount    = (item.comments || []).length;
//   const tag         = item.tag ? TAGS.find((t) => t.label === item.tag) : null;

//   const handleLike = async () => {
//     if (liked) {
//       setLiked(false);
//       await updateDoc(doc(db, "confessions", item.id), { likedBy: arrayRemove(SESSION_ID) });
//     } else {
//       setLiked(true);
//       setLikeAnim(true);
//       setTimeout(() => setLikeAnim(false), 700);
//       await updateDoc(doc(db, "confessions", item.id), { likedBy: arrayUnion(SESSION_ID) });
//     }
//   };

//   const handleComment = async () => {
//     if (!cmtText.trim()) return;
//     const payload = { text: cmtText.trim(), authorId: SESSION_ID, createdAt: new Date().toISOString() };
//     setCmtText("");
//     await updateDoc(doc(db, "confessions", item.id), { comments: arrayUnion(payload) });
//   };

//   return (
//     <article className="post-card" style={{ animationDelay: `${Math.min(index * 0.07, 0.56)}s` }}>

//       {/* Header */}
//       <div className="post-header">
//         <Avatar id={item.id} size={40} />
//         <div className="post-meta">
//           <span className="post-author">Anonymous</span>
//           <span className="post-time">{timeAgo(item.createdAt)} ago</span>
//         </div>
//         {tag && <span className="post-tag">{tag.emoji} {tag.label}</span>}
//       </div>

//       {/* Body */}
//       <p className="post-text">{item.text}</p>

//       {/* Action bar — Instagram layout */}
//       <div className="action-bar">
//         <div className="action-left">
//           <button className={`act-btn ${liked ? "liked" : ""}`} onClick={handleLike} aria-label="Like">
//             <svg className={likeAnim ? "heart-pop" : ""} viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
//               <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
//             </svg>
//           </button>
//           <button
//             className="act-btn"
//             onClick={() => { setShowCmt(v => !v); setTimeout(() => inputRef.current?.focus(), 80); }}
//             aria-label="Comment"
//           >
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
//               <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
//             </svg>
//           </button>
//         </div>
//         <button className="act-btn" aria-label="Save">
//           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
//             <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
//           </svg>
//         </button>
//       </div>

//       {/* Likes count */}
//       {likeCount > 0 && (
//         <p className="likes-line">{likeCount} {likeCount === 1 ? "heart" : "hearts"}</p>
//       )}

//       {/* Comment preview */}
//       {cmtCount > 0 && !showCmt && (
//         <button className="view-comments" onClick={() => setShowCmt(true)}>
//           View {cmtCount === 1 ? "1 comment" : `all ${cmtCount} comments`}
//         </button>
//       )}

//       {/* Comments expand */}
//       {showCmt && (
//         <div className="comments-block">
//           {(item.comments || []).length === 0 && (
//             <p className="no-cmt">Be the first to respond ♡</p>
//           )}
//           {(item.comments || []).map((c, i) => <CommentItem key={i} comment={c} />)}
//           <div className="cmt-input-row">
//             <Avatar id={SESSION_ID} size={28} />
//             <input
//               ref={inputRef}
//               value={cmtText}
//               onChange={e => setCmtText(e.target.value)}
//               onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleComment(); }}}
//               placeholder="Add a comment…"
//               className="cmt-input"
//               maxLength={200}
//             />
//             {cmtText.trim() && (
//               <button className="cmt-post-btn" onClick={handleComment}>Post</button>
//             )}
//           </div>
//         </div>
//       )}
//     </article>
//   );
// }

// // ── Compose ────────────────────────────────────────────────────────
// function Compose({ onPost }) {
//   const [text,    setText]    = useState("");
//   const [tag,     setTag]     = useState("");
//   const [open,    setOpen]    = useState(false);
//   const [loading, setLoading] = useState(false);
//   const remaining = MAX_CHARS - text.length;

//   const handleShare = async () => {
//     if (!text.trim() || remaining < 0) return;
//     setLoading(true);
//     await onPost(text.trim(), tag);
//     setText(""); setTag(""); setOpen(false); setLoading(false);
//   };

//   return (
//     <div className={`compose ${open ? "open" : ""}`}>
//       <div className="compose-top">
//         <Avatar id={SESSION_ID} size={40} />
//         <textarea
//           value={text}
//           onChange={e => setText(e.target.value)}
//           onFocus={() => setOpen(true)}
//           placeholder="Share something from the heart…"
//           className="compose-ta"
//           rows={open ? 4 : 1}
//         />
//       </div>
//       {open && (
//         <>
//           <div className="tag-grid">
//             {TAGS.map(t => (
//               <button
//                 key={t.label}
//                 className={`tag-pill ${tag === t.label ? "active" : ""}`}
//                 onClick={() => setTag(tag === t.label ? "" : t.label)}
//               >
//                 {t.emoji} {t.label}
//               </button>
//             ))}
//           </div>
//           <div className="compose-footer">
//             <div className="progress-ring-wrap">
//               <svg className="progress-ring" viewBox="0 0 32 32">
//                 <circle cx="16" cy="16" r="12" fill="none" stroke="var(--petal-border)" strokeWidth="3"/>
//                 <circle
//                   cx="16" cy="16" r="12" fill="none"
//                   stroke={remaining < 0 ? "var(--warn)" : remaining < 40 ? "var(--rose-mid)" : "var(--rose)"}
//                   strokeWidth="3"
//                   strokeDasharray={`${Math.min((text.length / MAX_CHARS) * 75.4, 75.4)} 75.4`}
//                   strokeLinecap="round"
//                   transform="rotate(-90 16 16)"
//                 />
//               </svg>
//               {remaining <= 40 && (
//                 <span className={`ring-num ${remaining < 0 ? "over" : ""}`}>{remaining}</span>
//               )}
//             </div>
//             <div className="compose-btns">
//               <button className="cancel-btn" onClick={() => { setOpen(false); setText(""); setTag(""); }}>Cancel</button>
//               <button
//                 className={`share-btn ${text.trim() && remaining >= 0 ? "ready" : ""}`}
//                 onClick={handleShare}
//                 disabled={!text.trim() || remaining < 0 || loading}
//               >
//                 {loading ? <span className="spinner"/> : "Share"}
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// // ── Stories-row tag filter ─────────────────────────────────────────
// function Stories({ active, setActive }) {
//   return (
//     <div className="stories">
//       <button className={`story ${active === "" ? "active" : ""}`} onClick={() => setActive("")}>
//         <div className="story-icon">🤍</div>
//         <span>All</span>
//       </button>
//       {TAGS.map(t => (
//         <button
//           key={t.label}
//           className={`story ${active === t.label ? "active" : ""}`}
//           onClick={() => setActive(active === t.label ? "" : t.label)}
//         >
//           <div className="story-icon">{t.emoji}</div>
//           <span>{t.label}</span>
//         </button>
//       ))}
//     </div>
//   );
// }

// // ── App ────────────────────────────────────────────────────────────
// export default function App() {
//   const [confessions, setConfessions] = useState([]);
//   const [filter, setFilter] = useState("");
//   const [sort,   setSort]   = useState("new");

//   useEffect(() => {
//     const q = query(collection(db, "confessions"), orderBy("createdAt", "desc"));
//     return onSnapshot(q, snap =>
//       setConfessions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
//     );
//   }, []);

//   const handlePost = (text, tag) =>
//     addDoc(collection(db, "confessions"), {
//       text, tag: tag || null, likedBy: [], comments: [],
//       createdAt: serverTimestamp(),
//     });

//   const displayed = confessions
//     .filter(c => !filter || c.tag === filter)
//     .sort((a, b) =>
//       sort === "top"
//         ? (b.likedBy?.length || 0) - (a.likedBy?.length || 0)
//         : (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
//     );

//   return (
//     <div className="app">
//       {/* Nav */}
//       <nav className="nav">
//         <div className="nav-inner">
//           <span className="brand">
//             <span className="brand-heart">♡</span>
//             <span className="brand-name">Whisper</span>
//           </span>
//           <div className="sort-toggle">
//             <button className={sort === "new" ? "active" : ""} onClick={() => setSort("new")}>Recent</button>
//             <button className={sort === "top" ? "active" : ""} onClick={() => setSort("top")}>Top</button>
//           </div>
//         </div>
//       </nav>

//       <main className="main">
//         <Stories active={filter} setActive={setFilter} />
//         <Compose onPost={handlePost} />

//         <div className="feed">
//           {displayed.length === 0 ? (
//             <div className="empty">
//               <p className="empty-heart">♡</p>
//               <p className="empty-text">No confessions yet.<br/>Be the first to share.</p>
//             </div>
//           ) : (
//             displayed.map((item, i) => <PostCard key={item.id} item={item} index={i} />)
//           )}
//         </div>
//       </main>

//       <footer className="footer">
//         <p>Every word is anonymous · Shared with love</p>
//       </footer>
//     </div>
//   );
// }


// src/App.jsx
// Root of the application.
// - AppProvider wraps everything for global state (session, profile, unread count)
// - BrowserRouter handles client-side routing
// - BottomNav is always visible across all pages

// src/App.jsx

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import { AppProvider } from "./context/AppContext";

import Explore     from "./pages/Explore";
import AddPost     from "./pages/AddPost";
import Alerts      from "./pages/Alerts";
import Profile     from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import BottomNav   from "./components/BottomNav";
import Login       from "./pages/Login";
import Signup      from "./pages/Signup";

import "./App.css";

// ── Layout Wrapper ─────────────────────────────────────────
function Layout() {
  const location = useLocation();

  // Routes where BottomNav should NOT be shown
  const hideNavRoutes = ["/", "/signup", "/login"];

  const hideNav = hideNavRoutes.includes(location.pathname);

  return (
    <div className="app">
      <Routes>
        {/* Auth pages */}
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Main app pages */}
        <Route path="/explore" element={<Explore />} />
        <Route path="/add" element={<AddPost />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
      </Routes>

      {/* Bottom Navigation (hidden on auth pages) */}
      {!hideNav && <BottomNav />}
    </div>
  );
}

// ── Root App ───────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <Router>
        <Layout />
      </Router>
    </AppProvider>
  );
}