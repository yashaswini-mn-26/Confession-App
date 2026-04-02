// src/components/BottomNav.jsx
// Bottom tab bar with live unread badge on Alerts.
// Uses AppContext for the unread count (avoids prop-drilling).

import { Link, useLocation } from "react-router-dom";
import { Compass, PlusSquare, Bell, User } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function BottomNav() {
  const location    = useLocation();
  const { unreadCount } = useApp();
  const at = (path) => location.pathname === path;

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      <Link className={at("/explore") ? "active" : ""} to="/explore" aria-label="Explore">
        <Compass size={22} strokeWidth={1.8} />
        <span>Explore</span>
      </Link>

      <Link className={at("/add") ? "active" : ""} to="/add" aria-label="Add post">
        <PlusSquare size={22} strokeWidth={1.8} />
        <span>Add</span>
      </Link>

      <Link className={at("/alerts") ? "active" : ""} to="/alerts" aria-label={`Alerts${unreadCount ? `, ${unreadCount} unread` : ""}`}>
        <div style={{ position: "relative", display: "inline-flex" }}>
          <Bell size={22} strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span className="notif-badge">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        <span>Alerts</span>
      </Link>

      <Link className={at("/profile") ? "active" : ""} to="/profile" aria-label="Profile">
        <User size={22} strokeWidth={1.8} />
        <span>Profile</span>
      </Link>
    </nav>
  );
}