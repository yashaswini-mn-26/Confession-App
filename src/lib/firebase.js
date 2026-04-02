// src/lib/firebase.js
// ─────────────────────────────────────────────────────────────────
// Replace firebaseConfig values with your own from Firebase Console
// ─────────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection, doc,
  addDoc, updateDoc, deleteDoc, getDoc, getDocs,
  onSnapshot, query, orderBy, where, limit,
  serverTimestamp, arrayUnion, arrayRemove,
  increment, startAfter
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "firebase/auth";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);

// ── Auth helpers ────────────────────────────────────────────────
export const signInAnon = () => signInAnonymously(auth);
export const onUser     = (cb) => onAuthStateChanged(auth, cb);

// ── Confession helpers ──────────────────────────────────────────
export const FEED_PAGE = 12;

export const postConfession = (uid, { text, tag, mood }) =>
  addDoc(collection(db, "confessions"), {
    text, tag: tag || null, mood: mood || null,
    authorId: uid,
    likedBy: [],
    commentCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const toggleLike = async (docId, uid, currentlyLiked) => {
  const ref = doc(db, "confessions", docId);
  await updateDoc(ref, {
    likedBy: currentlyLiked ? arrayRemove(uid) : arrayUnion(uid),
  });
};

export const deleteConfession = (docId) =>
  deleteDoc(doc(db, "confessions", docId));

export const feedQuery = (tag, sortBy) => {
  const base = collection(db, "confessions");
  // "top" fetches recent 50 then client-sorts by like count
  // (Firestore can't orderBy an array field)
  if (tag) {
    return query(base, where("tag", "==", tag), orderBy("createdAt", "desc"), limit(50));
  }
  return query(base, orderBy("createdAt", "desc"), limit(sortBy === "top" ? 50 : FEED_PAGE));
};

// ── Comment helpers ─────────────────────────────────────────────
export const addComment = (confessionId, uid, text) =>
  addDoc(collection(db, "confessions", confessionId, "comments"), {
    text, authorId: uid,
    likedBy: [],
    createdAt: serverTimestamp(),
  });

export const commentsQuery = (confessionId) =>
  query(
    collection(db, "confessions", confessionId, "comments"),
    orderBy("createdAt", "asc")
  );

export const incrementCommentCount = (confessionId) =>
  updateDoc(doc(db, "confessions", confessionId), {
    commentCount: increment(1),
  });

// ── User profile helpers ────────────────────────────────────────
export const upsertProfile = (uid, data) =>
  updateDoc(doc(db, "users", uid), { ...data, updatedAt: serverTimestamp() })
    .catch(() =>
      addDoc(collection(db, "users"), { uid, ...data, createdAt: serverTimestamp() })
    );

export const getProfile = (uid) => getDoc(doc(db, "users", uid));

// ── Notification helpers ────────────────────────────────────────
export const notificationsQuery = (uid) =>
  query(
    collection(db, "notifications"),
    where("recipientId", "==", uid),
    orderBy("createdAt", "desc"),
    limit(30)
  );

export const markNotifRead = (notifId) =>
  updateDoc(doc(db, "notifications", notifId), { read: true });

// ── Re-export Firestore primitives ──────────────────────────────
export {
  collection, doc, onSnapshot, serverTimestamp,
  arrayUnion, arrayRemove, query, orderBy, where, limit,
  updateDoc, addDoc, getDoc, getDocs, startAfter
};

// ── Email Auth ────────────────────────────────────────────────
export const signInEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

// ── Google Auth ───────────────────────────────────────────────
const googleProvider = new GoogleAuthProvider();

export const signInGoogle = () =>
  signInWithPopup(auth, googleProvider);  

// ── Email Signup ───────────────────────────────────────────────
export const signUpEmail = async (email, password, name) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  // Set display name (optional but good)
  if (name) {
    await updateProfile(res.user, {
      displayName: name,
    });
  }

  return res.user;
};