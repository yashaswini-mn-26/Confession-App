// src/pages/Alerts.jsx
// Real-time notifications page.
// - Shows like and comment notifications
// - Click to mark individual as seen
// - "Mark all read" batch update
// - Unread items highlighted

import { useNotifications } from "../hooks/useNotifications";
import { timeAgo }          from "../lib/timeAgo";
import Navbar               from "../components/Navbar";
import "./Alerts.css";

export default function Alerts() {
  const { notifs, loading, markSeen, markAllSeen } = useNotifications();
  const hasUnread = notifs.some(n => !n.seen);

  return (
    <>
      <Navbar />
      <div
        className="page"
        style={{ maxWidth: 560, margin: "0 auto", padding: "20px", minHeight: "90vh" }}
        role="main"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", color: "var(--text-1)" }}>Notifications</h3>
          {hasUnread && (
            <button
              onClick={markAllSeen}
              style={{
                fontSize: "0.75rem", fontWeight: 600,
                color: "var(--rose)", background: "none",
                border: "none", cursor: "pointer", padding: "4px 8px"
              }}
              aria-label="Mark all notifications as read"
            >
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="empty">
            <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
          </div>
        ) : notifs.length === 0 ? (
          <div className="empty">
            <p className="empty-heart">🔔</p>
            <p className="empty-text">
              No notifications yet.<br />
              Likes and comments will appear here.
            </p>
          </div>
        ) : (
          <div className="notif-list" role="list">
            {notifs.map(n => (
              <div
                key={n.id}
                role="listitem"
                className={`notif-card ${!n.seen ? "unseen" : ""}`}
                onClick={() => markSeen(n.id)}
                tabIndex={0}
                onKeyDown={e => e.key === "Enter" && markSeen(n.id)}
                aria-label={`${n.type === "like" ? "Like" : "Comment"} notification, ${n.seen ? "read" : "unread"}`}
              >
                <div className="notif-icon" aria-hidden="true">
                  {n.type === "like" ? "❤️" : "💬"}
                </div>
                <div className="notif-content">
                  <p>
                    {n.type === "like"
                      ? "Someone liked your whisper"
                      : `Someone replied: "${n.text?.slice(0, 60)}${n.text?.length > 60 ? "…" : ""}"`
                    }
                  </p>
                  <span>{timeAgo(n.createdAt)} ago</span>
                </div>
                {!n.seen && <div className="notif-dot" aria-hidden="true" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}