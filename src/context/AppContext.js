// src/context/AppContext.jsx
// Global context: session ID, user profile cache, unread notification count.
// Wrap your entire app in <AppProvider> so all pages share this state.

import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
  doc, getDoc, setDoc,
  collection, query, where, onSnapshot
} from "firebase/firestore";
import { SESSION_ID, defaultAvatar, defaultUsername } from "../lib/session";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(null);         // { username, bio, avatar }
  const [unreadCount, setUnreadCount] = useState(0);    // badge count for Alerts tab

  // ── Load or seed user profile ──────────────────────────────────
  useEffect(() => {
    const ref = doc(db, "users", SESSION_ID);
    getDoc(ref).then(snap => {
      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        // First-time user: seed default profile
        const defaultProfile = {
          userId:   SESSION_ID,
          username: defaultUsername(),
          bio:      "",
          avatar:   defaultAvatar(),
        };
        setDoc(ref, defaultProfile);
        setProfile(defaultProfile);
      }
    });
  }, []);

  // ── Subscribe to unread notifications (badge count) ────────────
  useEffect(() => {
    if (!SESSION_ID) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", SESSION_ID),
      where("seen",   "==", false)
    );
    return onSnapshot(q, snap => setUnreadCount(snap.size));
  }, []);

  const updateProfile = (data) => {
    setProfile(prev => ({ ...prev, ...data }));
  };

  return (
    <AppContext.Provider value={{ SESSION_ID, profile, updateProfile, unreadCount }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);