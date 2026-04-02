// src/hooks/useProfile.js
// Fetches and saves a user profile from Firestore.
// Uses AppContext cache to avoid redundant reads.

import { useState } from "react";
import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { SESSION_ID } from "../lib/session";
import { useApp } from "../context/AppContext";

export function useProfile() {
  const { profile, updateProfile } = useApp();
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  const saveProfile = async ({ username, bio, avatar }) => {
    setSaving(true);
    setError(null);
    try {
      const data = { userId: SESSION_ID, username, bio, avatar };
      await setDoc(doc(db, "users", SESSION_ID), data);
      updateProfile(data);
    } catch (e) {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return { profile, saveProfile, saving, error };
}