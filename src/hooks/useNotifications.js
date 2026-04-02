// src/hooks/useNotifications.js
// Real-time subscription to this user's notifications.
// Sorted by newest first. Provides a markSeen helper.

import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
  collection, query, where,
  orderBy, onSnapshot, updateDoc, doc, writeBatch
} from "firebase/firestore";
import { SESSION_ID } from "../lib/session";

export function useNotifications() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!SESSION_ID) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", SESSION_ID),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, snap => {
      setNotifs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsub;
  }, []);

  const markSeen = async (id) => {
    await updateDoc(doc(db, "notifications", id), { seen: true });
  };

  const markAllSeen = async () => {
    const unseen = notifs.filter(n => !n.seen);
    if (!unseen.length) return;
    const batch = writeBatch(db);
    unseen.forEach(n => batch.update(doc(db, "notifications", n.id), { seen: true }));
    await batch.commit();
  };

  return { notifs, loading, markSeen, markAllSeen };
}