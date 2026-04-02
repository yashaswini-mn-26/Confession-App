// src/lib/session.js
// Generates and persists a unique anonymous session ID per browser tab/session.
// This is the identity layer for Whisper — users remain anonymous,
// but their actions (posts, likes, notifications) are tied to this ID.

export const SESSION_ID = (() => {
  let id = sessionStorage.getItem("cw_uid");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("cw_uid", id);
  }
  return id;
})();

// Deterministic avatar and username from session ID
const AVATARS = ["🌸", "🌷", "🌹", "💐", "🌺", "🌼", "🍀", "🦋", "🕊️", "✨", "🌙", "💫"];
const NAMES   = ["SilentSoul","HiddenHeart","MidnightMind","SoftEcho","LostVoice","MoonWhisper","PetalDream","StarlightSoul"];

export const defaultAvatar   = (id = SESSION_ID) => AVATARS[parseInt(id.slice(-3), 36) % AVATARS.length];
export const defaultUsername = (id = SESSION_ID) => NAMES[parseInt(id.slice(-3), 36) % NAMES.length];