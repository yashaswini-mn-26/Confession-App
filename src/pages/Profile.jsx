// src/pages/Profile.jsx
// User profile: avatar, username, bio, stats, own posts.
// Links to EditProfile. Stats update in real-time.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db }   from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useApp }   from "../context/AppContext";
import Navbar       from "../components/Navbar";
import PostCard     from "../components/PostCard";
import "./Profile.css";

export default function Profile() {
  const { SESSION_ID, profile } = useApp();
  const [myPosts,    setMyPosts]    = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "confessions"),
      where("authorId", "==", SESSION_ID)
    );
    return onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort newest first client-side
      docs.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setMyPosts(docs);
      setLoading(false);
    });
  }, [SESSION_ID]);

  const totalLikes = myPosts.reduce((acc, p) => acc + (p.likedBy?.length || 0), 0);

  return (
    <>
      <Navbar />
      <div
        className="page"
        style={{ maxWidth: 560, margin: "0 auto", padding: "20px", minHeight: "100vh" }}
        role="main"
      >
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar" aria-label={`Avatar: ${profile?.avatar}`}>
            {profile?.avatar || "🌸"}
          </div>
          <div className="profile-info">
            <h3>{profile?.username || "Anonymous"}</h3>
            <p>{profile?.bio || "Anonymous · Whisper User"}</p>
          </div>
        </div>

        {/* Edit Button */}
        <Link to="/edit-profile" className="edit-btn" aria-label="Edit profile">
          Edit Profile
        </Link>

        {/* Stats */}
        <div className="profile-stats" role="group" aria-label="Profile statistics">
          <div>
            <h4>{myPosts.length}</h4>
            <span>Posts</span>
          </div>
          <div>
            <h4>{totalLikes}</h4>
            <span>Hearts</span>
          </div>
        </div>

        {/* Posts */}
        <div
          className="feed"
          role="feed"
          aria-busy={loading}
          aria-label="Your posts"
          style={{ marginTop: "0.75rem" }}
        >
          {loading ? (
            <div className="empty">
              <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
            </div>
          ) : myPosts.length === 0 ? (
            <div className="empty">
              <p className="empty-heart">🌸</p>
              <p className="empty-text">
                You haven't shared anything yet.<br />
                Your whispers will appear here.
              </p>
            </div>
          ) : (
            myPosts.map((post, i) => (
              <PostCard key={post.id} item={post} index={i} />
            ))
          )}
        </div>
      </div>
    </>
  );
}