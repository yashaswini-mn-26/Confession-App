// src/hooks/useConfessions.js
// Real-time Firestore subscription for the confession feed.
// Supports pagination: initial batch of LIMIT posts, then "load more".
// Returns sorted data client-side for instant re-sort without re-fetching.

import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
  collection, query, orderBy,
  onSnapshot, limit, startAfter
} from "firebase/firestore";

const LIMIT = 25;

export function useConfessions() {
  const [confessions, setConfessions]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [hasMore, setHasMore]           = useState(true);
  const [lastDoc, setLastDoc]           = useState(null);

  // Initial subscription
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "confessions"),
      orderBy("createdAt", "desc"),
      limit(LIMIT)
    );

    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setConfessions(docs);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === LIMIT);
      setLoading(false);
    });

    return unsub;
  }, []);

  // Load more (pagination)
  const loadMore = async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);

    const q = query(
      collection(db, "confessions"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(LIMIT)
    );

    const { getDocs } = await import("firebase/firestore");
    const snap = await getDocs(q);
    const more = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    setConfessions(prev => {
      // Deduplicate
      const ids = new Set(prev.map(p => p.id));
      return [...prev, ...more.filter(p => !ids.has(p.id))];
    });
    setLastDoc(snap.docs[snap.docs.length - 1] || null);
    setHasMore(snap.docs.length === LIMIT);
    setLoadingMore(false);
  };

  return { confessions, loading, loadMore, loadingMore, hasMore };
}