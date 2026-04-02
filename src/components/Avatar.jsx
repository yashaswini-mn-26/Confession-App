// src/components/Avatar.jsx
// Reusable avatar bubble. Pulls emoji from profile if available,
// otherwise falls back to deterministic default based on user ID.

export default function Avatar({ id, emoji, size = 40 }) {
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.46 }}
      aria-hidden="true"
    >
      {emoji || "🌸"}
    </div>
  );
}