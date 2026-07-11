/**
 * firebase.ts
 * Firebase config for SpellCoach — its own dedicated project (spellcoach-e3af3).
 * Sign in with Google; both Erin and Zaidon use their Google accounts.
 *
 * Firestore path for shared lists:
 *   spellcoach_shared/lists  →  { lists: WordList[], lastUpdated: string, updatedBy: string }
 *
 * Both users have equal read/write access — no parent/student distinction.
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

// ── Firebase project config (SpellCoach's own dedicated project) ──
const firebaseConfig = {
  apiKey: "AIzaSyDB_gdezHlZDhut6-ywsUqX_RH7Y2vrp0Q",
  authDomain: "spellcoach-e3af3.firebaseapp.com",
  projectId: "spellcoach-e3af3",
  storageBucket: "spellcoach-e3af3.firebasestorage.app",
  messagingSenderId: "329053543914",
  appId: "1:329053543914:web:6139a02286c82cfdf9a693"
};

const app = initializeApp(firebaseConfig, 'spellcoach');
export const db = getFirestore(app);
export const auth = getAuth(app);

// ── Shared Firestore path ──────────────────────────────────────────────────────
// Single shared document — any logged-in user can read/write.
const LISTS_DOC = doc(db, 'spellcoach_shared', 'lists');

export interface WordList {
  id: string;
  name: string;
  words: string[];
  active: boolean;
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

export const firebaseSignIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

// Google sign-in — auto-creates the account on first login.
const googleProvider = new GoogleAuthProvider();
export const firebaseSignInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const firebaseSignOut = () => signOut(auth);

export const onAuthChange = (cb: (user: User | null) => void) =>
  onAuthStateChanged(auth, cb);

// ── Firestore list sync ───────────────────────────────────────────────────────

/**
 * Push the current list state to Firestore.
 * Called on every local change so the other device picks it up in real time.
 */
export const pushLists = async (lists: WordList[], userEmail: string): Promise<void> => {
  await setDoc(LISTS_DOC, {
    lists,
    lastUpdated: new Date().toISOString(),
    updatedBy: userEmail,
  });
};

/**
 * Subscribe to real-time list updates.
 * Returns an unsubscribe function — call it on component unmount.
 */
export const subscribeLists = (
  onUpdate: (lists: WordList[]) => void
): Unsubscribe => {
  return onSnapshot(LISTS_DOC, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.lists)) {
        onUpdate(data.lists as WordList[]);
      }
    }
  });
};

// ── Activity Log (Parent Tracking) ───────────────────────────────────────────
// Stores each completed session so a parent can review daily activity.

export interface ActivityEntry {
  id?: string;
  type: 'quiz' | 'quiet' | 'wordsearch';
  date: string;            // ISO string
  listName: string;        // which word list was used
  score: number;           // correct count
  total: number;           // total words
  pct: number;             // percentage
  restarts: number;        // how many times they restarted / remixed
  userEmail: string;
}

const ACTIVITY_COL = collection(db, 'spellcoach_activity');

/**
 * Log a completed practice session to Firestore.
 */
export const logActivity = async (entry: Omit<ActivityEntry, 'id'>): Promise<void> => {
  await addDoc(ACTIVITY_COL, entry);
};

/**
 * Fetch recent activity entries (newest first).
 */
export const fetchActivity = async (count: number = 100): Promise<ActivityEntry[]> => {
  const q = query(ACTIVITY_COL, orderBy('date', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityEntry));
};

// ── Parent PIN ───────────────────────────────────────────────────────────────
const PIN_DOC = doc(db, 'spellcoach_shared', 'parent_pin');

export const saveParentPin = async (pin: string): Promise<void> => {
  await setDoc(PIN_DOC, { pin });
};

export const getParentPin = async (): Promise<string | null> => {
  const snap = await getDocs(query(collection(db, 'spellcoach_shared')));
  for (const d of snap.docs) {
    if (d.id === 'parent_pin' && d.data().pin) return d.data().pin;
  }
  return null;
};

// ── Missed Words Sync ───────────────────────────────────────────────────────
// Shared missed-words list that syncs across devices in real time.
const MISSED_DOC = doc(db, 'spellcoach_shared', 'missed_words');

/**
 * Push the current missed words to Firestore.
 */
export const pushMissedWords = async (words: string[], userEmail: string): Promise<void> => {
  await setDoc(MISSED_DOC, {
    words,
    lastUpdated: new Date().toISOString(),
    updatedBy: userEmail,
  });
};

/**
 * Subscribe to real-time missed words updates.
 */
export const subscribeMissedWords = (
  onUpdate: (words: string[]) => void
): Unsubscribe => {
  return onSnapshot(MISSED_DOC, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.words)) {
        onUpdate(data.words as string[]);
      }
    }
  });
};
