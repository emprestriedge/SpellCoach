# Firestore Rules Update for SpellCoach

SpellCoach stores word lists in a shared Firestore document under the same Firebase
project as FocusBuddy and Zaiden's Workshop. You need to add one new rule block so
authenticated users can read/write that path.

---

## What to do (takes about 2 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Open project **gen-lang-client-0838687198**
3. In the left sidebar: **Firestore Database → Rules**
4. Replace the entire rules with the block below
5. Click **Publish**

---

## Updated Firestore Rules (copy & paste the whole thing)

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // ============================================================
    // USER PROFILES — focusbuddy_users/{userId}
    // ============================================================
    match /focusbuddy_users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;

      match /schedule/{docId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null;
      }

      match /activity/{docId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null;
      }
    }

    // ============================================================
    // SHARED STUDENT DATA — focusbuddy_students/{studentUid}
    // ============================================================
    match /focusbuddy_students/{studentUid}/{subcollection}/{docId} {
      allow read, write: if request.auth != null;
    }

    // ============================================================
    // SPELLCOACH SHARED LISTS — spellcoach_shared/lists
    // Any logged-in user (Erin or Zaidon) can read/write.
    // Both accounts share the same single document.
    // ============================================================
    match /spellcoach_shared/{docId} {
      allow read, write: if request.auth != null;
    }

    // Default: deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## What this does

- Adds access to `spellcoach_shared/lists` — the single shared document where
  SpellCoach stores all word lists
- Any logged-in user (Erin **or** Zaidon) can read and write it — no roles,
  no restrictions, equal access for both accounts
- Everything else about FocusBuddy's rules stays exactly the same

---

## After publishing

Open SpellCoach on both devices, log in with either account, and create or edit a list.
The change should appear on the other device within a second or two.
