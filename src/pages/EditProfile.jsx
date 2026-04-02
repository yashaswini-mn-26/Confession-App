// src/pages/EditProfile.jsx
// Edit username, bio, and avatar.
// Pre-fills from AppContext profile cache, saves to Firestore.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile }  from "../hooks/useProfile";
import Navbar          from "../components/Navbar";
import "./EditProfile.css";

const AVATARS = ["🌸","🌷","🌹","💐","🌺","🌼","🦋","✨","🌙","💫","🍀","🕊️"];

export default function EditProfile() {
  const navigate = useNavigate();
  const { profile, saveProfile, saving, error } = useProfile();

  const [username, setUsername] = useState("");
  const [bio,      setBio]      = useState("");
  const [avatar,   setAvatar]   = useState("🌸");

  // Pre-fill from context cache (no extra Firestore read needed)
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setAvatar(profile.avatar || "🌸");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!username.trim()) return;
    await saveProfile({ username: username.trim(), bio: bio.trim(), avatar });
    navigate("/profile");
  };

  return (
    <>
      <Navbar />
      <div
        style={{ maxWidth: 560, margin: "0 auto", padding: "20px", minHeight: "100vh" }}
        role="main"
      >
        <h3 style={{ fontSize: "1.1rem", color: "var(--text-1)", marginBottom: "1rem" }}>
          Edit Profile
        </h3>

        {/* Avatar Picker */}
        <div className="avatar-select" role="group" aria-label="Choose your avatar">
          {AVATARS.map(a => (
            <span
              key={a}
              className={avatar === a ? "active" : ""}
              onClick={() => setAvatar(a)}
              role="radio"
              aria-checked={avatar === a}
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && setAvatar(a)}
              aria-label={`Avatar ${a}`}
            >
              {a}
            </span>
          ))}
        </div>

        {/* Username */}
        <label htmlFor="username" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-3)", marginTop: "1rem" }}>
          Username
        </label>
        <input
          id="username"
          className="input"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          maxLength={32}
          autoComplete="off"
        />

        {/* Bio */}
        <label htmlFor="bio" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-3)", marginTop: "1rem" }}>
          Bio
        </label>
        <textarea
          id="bio"
          className="input"
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="Write your bio…"
          rows={3}
          maxLength={150}
          style={{ resize: "vertical" }}
        />
        <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "4px", textAlign: "right" }}>
          {150 - bio.length} chars left
        </p>

        {error && (
          <p style={{ color: "var(--warn)", fontSize: "0.85rem", marginTop: "0.5rem" }}>{error}</p>
        )}

        <button
          className="save-btn"
          onClick={handleSave}
          disabled={!username.trim() || saving}
          aria-label="Save profile"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </>
  );
}