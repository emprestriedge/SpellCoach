> **2026-07-11 snapshot (pre-migration cleanup):** Live at spellcoach.netlify.app; `Deploy/` (Jun-18 drop) = the live site. Stale `dist/` (Jun 15) → Trash/SpellCoach this session; the older dist-* folders mentioned below were already cleaned Jun 23. GitHub: repo `SpellCoach` exists (public, uploaded Apr 10 via web) but the local clone has NO remote — being reconciled in this session. Memory consolidated here from central memory.

# SpellCoach — Project Memory

> **2026-06-15 — Icon + deploy fix (see `memory/projects/app-icons.md`).** Got a custom icon
> (glossy red "ABC" block, full-bleed). Deploy was failing on Netlify with
> `ENOENT … package.json`: the `Deploy/` folder she dragged contains a `netlify.toml` with
> `command = "npm run build"`, so Netlify tried to build a folder that has no `package.json`.
> Code builds fine locally (1691 modules). FIX: deploy the **`SPELLCOACH-DEPLOY`** folder
> (pure static + `_redirects`, no netlify.toml) instead of `Deploy/`. Optional permanent fix:
> clear the build command in the SpellCoach Netlify site settings.

## Overview
Single-purpose spelling tutor app for Zaiden (14, ADHD, homeschool). React + Vite + Tailwind, deployed on Netlify at **spellcoach.netlify.app**. Netlify site ID: `f5e53c58-2546-4104-ba40-19cb9a5f9c64`. GitHub repo exists but is currently **unlinked** from Netlify (manual deploys via drag-and-drop).

## Source Location
- Source: `~/SpellCoach/spellcoach/` (mounted as `/mnt/SpellCoach/spellcoach/`)
- Main file: `src/App.tsx` (entire app lives in one file)
- Deploy builds go to: `spellcoach-deploy-v2/` folder inside SpellCoach directory

## Tech Stack
- React 18 + TypeScript + Vite + Tailwind CSS 4
- Single-file app (`App.tsx`) with all components extracted at top level (not nested inside parent — prevents remounting bugs)
- Chrome Web Speech API for text-to-speech
- Netlify for hosting (manual deploy, no GitHub link currently)
- **Firebase** (same project as FocusBuddy/Zaiden's Workshop): Auth + Firestore for login and real-time list sync

## App Structure
- **Dashboard**: 4 main cards (Start Quiz, Quiet Practice, Word Search, Missed Words) + MyLists and New List buttons
- **Quiz**: Audio-based spelling quiz with score tracking, streaks, star ratings, end screen
- **Quiet Practice**: Multiple-choice (no audio), same scoring/streak/end screen system
- **Word Search**: Menu → Setup (list picker + difficulty) → Puzzle with remix button
- **Missed Words**: Review words gotten wrong, practice them specifically
- **MyLists**: View/manage custom word lists, expand to see words, launch Quiz/Quiet from any list
- **Create List**: Category → auto-config → checkbox word selection → name + save

## Dictionary & Word Banks
- ~55 words in DICTIONARY with pronunciations, definitions, examples, tips, wrong options
- 6 categories × 3 difficulty levels (Easy/Medium/Hard), each with 20 words
- Categories: Everyday Words, Commonly Misspelled, Academic Words, Writing Words, Challenge Words, Confusing Words

## Design System
- Dark purple/black gradient background: `bg-[radial-gradient(ellipse_at_center,_#645188_0%,_#000000_80%)]`
- Glass card UI: `bg-[#886451]/20 backdrop-blur-xl border border-[#528881]/30`
- Color palette: rose #885159, purple #645188, brown #886451, teal #528881, black #000000
- Teal (#528881) is the primary accent; rose (#885159) for primary buttons and error states
- Google Fonts: title font + subtitle font + body font (defined in CSS)
- 44px minimum touch targets for mobile

## Key Technical Decisions
- All components (Quiz, QuietPractice, WordSearchPuzzle, etc.) defined OUTSIDE the main SpellCoach component to prevent React remounting on parent state changes
- `key` prop on Quiz/QuietPractice forces remount when word list changes
- Speech synthesis uses 80ms setTimeout after cancel() for Chrome compatibility
- Keepalive timer cancels speech synthesis every 10s when not speaking (Chrome bug workaround)
- speakText rate 0.3 for "slow" button, 1.0 for normal

## Progress Log

### 2026-04-14 — Session 4 (List picker + shuffle + MyLists glass button)
- Added a new **PracticeSetup** screen that appears before Quiz and Quiet Practice (same pattern as Word Search setup)
  - Dropdown contains: **Full Dictionary (63 words)** as the default, then "Active Lists (combined)" if any lists are active, then every individual custom list
  - Tap Start Quiz / Quiet Practice on dashboard → setup screen → pick list → Begin Quiz / Begin Practice
  - Words are shuffled at the moment "Begin" is tapped, so every session is a different order
- **Shuffle on "Try Again"**: both Quiz and QuietPractice now reshuffle words when the user taps Try Again / Start Over on the results screen (no more identical re-runs)
- Internal: added `orderedWords` state inside Quiz and QuietPractice components so the shuffle lives with the quiz instance, not the parent
- **MyLists button restyle**: replaced the outline TealButton with a custom glassy button — teal-tinted semi-transparent background (`bg-[#528881]/10`), heavy backdrop blur (`backdrop-blur-2xl`), soft teal border, inner shadow highlight, teal glow. Matches the main glass cards.
- Dashboard cards now route: Start Quiz → `quizSetup`, Quiet Practice → `quietSetup` (instead of directly launching the quiz)
- Old `startQuiz(words)` / `startQuiet(words)` helpers still exist and are used by MyLists "Quiz/Quiet" buttons and Missed Words "Practice These"
- Build: `npx vite build --outDir dist2` in sandbox (old `dist/` has locked files that can't be removed from sandbox)
- **First deploy attempt** (`69df14b7b539de4befe7d7f2`): succeeded but site was BLANK WHITE — no `netlify.toml` existed, so Netlify published the source root (dev `index.html` → `/src/main.tsx`) instead of `dist/`
- **Fix**: Created `netlify.toml` with:
  - `publish = "dist"` (correct publish dir)
  - `command = "npm run build"` (Netlify runs build in its own container)
  - `SECRETS_SCAN_ENABLED = "false"` (Firebase web API keys are flagged by Netlify's secret scanner even though they're designed to be public — safe to disable for this app since all real security is in Firestore rules)
  - SPA `/* → /index.html` 200 redirect for React Router fallback
- **Working deploy**: deployId `69df17a9b80406485cc67e9f`, state `ready`, live at https://spellcoach.netlify.app
- **GitHub NOT updated**: repo has no remote configured and no commits yet (same as prior sessions). Needs manual `git init` / remote setup before pushes can happen.

### 2026-04-14 — Session 3 (Firebase login + cross-device list sync)
- Added Firebase Auth + Firestore to SpellCoach using the **same Firebase project** as FocusBuddy and Zaiden's Workshop (`gen-lang-client-0838687198`)
- New files created:
  - `src/firebase.ts` — Firebase init, auth helpers, Firestore push/subscribe for shared lists
  - `src/Login.tsx` — Full-screen login gate, matching SpellCoach dark aesthetic, clear error messages
- Modified `src/App.tsx`:
  - Added auth state (`authUser`) — shows spinner while loading, Login screen if not authenticated
  - Added `saveListsToCloud()` — updates local state AND pushes to `spellcoach_shared/lists` in Firestore
  - Added real-time `subscribeLists()` listener — both devices get updates within ~1 second of any change
  - Echo suppression with `_suppressCloudUpdate` ref (same pattern as FocusBuddy)
  - Sign-out button and email display at bottom of dashboard
  - ListManager and CreateListFlow now call `saveListsToCloud` instead of local `setLists`
- Created `SpellCoach/FIRESTORE-RULES-UPDATE.md` — step-by-step instructions to add `spellcoach_shared` collection to Firebase rules (must be done in Firebase Console before deploy)
- Build verified: `npm run build` passes ✓
- **⚠️ ONE MANUAL STEP REQUIRED before deploy:** Update Firestore rules in Firebase Console per FIRESTORE-RULES-UPDATE.md

### 2026-04-10 — Session 1 (Major rewrite)
- Rewrote entire App.tsx with all 10 original bug fixes:
  - Added slow speak button (rate 0.3)
  - Fixed Quiet Mode cycling bug (extracted components outside parent)
  - Added end screens with star ratings for both Quiz and Quiet Practice
  - Fixed Quiz speech synthesis "no sound on 2nd entry" (cancel + 80ms delay)
  - Added 6 word bank categories with 3 difficulty levels
  - Redesigned Create List flow (choose → autoConfig → autoSelect → editList)
  - Redesigned MyLists (expand on click, show words, Quiz/Quiet/Active/Delete buttons)
  - Updated background gradient
  - Added mobile touch targets and meta tags
- Expanded dictionary from 8 to ~55 words
- Built successfully, placed in spellcoach-deploy folder
- **Deployment issues**: Netlify was GitHub-linked, couldn't push from sandbox. Multiple deploy attempts failed. Eventually unlinked GitHub repo from Netlify site settings.

### 2026-04-14 — Session 2 (Word Search overhaul)
- Completely rebuilt Word Search feature:
  - NEW: Word Search Menu screen with "Create New Puzzle" / "Continue" options
  - NEW: Setup page with list dropdown and difficulty dropdown (Regular: 5 words 10×10, Challenge: 8 words 14×14)
  - NEW: Remix button on puzzle page to regenerate with same words
  - FIXED: Word placement algorithm — now uses all 8 directions, shuffles positions, sorts longest-first, retries entire grid up to 20 times. No more missing words.
  - NEW: "Continue" button resumes last puzzle (persists in React state within session)
- Built successfully to `spellcoach-deploy-v2/`
- **Deploy status**: Build ready in `spellcoach-deploy-v2/`, needs manual drag-and-drop to Netlify deploys page

### 2026-04-21 — Session 5 (Parent Dashboard + Activity Tracking)
- **NEW: Activity Logging** — every completed Quiz, Quiet Practice, and Word Search session is automatically logged to Firestore (`spellcoach_activity` collection) with: type, date/time, list name, score, percentage, restart count, and user email
- **NEW: Parent Dashboard** — accessible via small shield icon at bottom of dashboard, protected by 4-digit PIN stored in Firestore
  - PIN setup flow: first visit prompts PIN creation, then requires PIN to access
  - "Change PIN" option available inside the dashboard
  - **30-day calendar**: green squares for days with quiz/quiet practice, star for word-search-only days, outline for today
  - **Stats row**: current streak, total quizzes completed, average score percentage
  - **Activity log**: scrollable list of all sessions with type, list name, score, restarts, date/time
  - Word Search entries labeled "Bonus" in the log (per Erin's star system — extra credit, not daily requirement)
- **Restart tracking**: Quiz, Quiet Practice, and Word Search all track how many times "Try Again" / "Start Over" / "Remix" is tapped — shown in parent dashboard
- **List name tracking**: PracticeSetup and WordSearchSetup now pass the selected list name through to child components for logging
- Updated `firebase.ts`: added `collection`, `addDoc`, `query`, `orderBy`, `limit`, `getDocs` imports; added `ActivityEntry` interface, `logActivity()`, `fetchActivity()`, `saveParentPin()`, `getParentPin()` functions
- **Firestore rules note**: `spellcoach_activity` collection needs to be added to Firestore rules (same pattern as `spellcoach_shared`) — see updated instructions below
- Deployed to Netlify: deployId `69e777384f56ef4ae09f0230`, live at https://spellcoach.netlify.app
- **GitHub still not updated** — no remote configured, no `gh` CLI in sandbox. Needs manual setup.

## Firestore Rules Update Needed
The new `spellcoach_activity` collection and `spellcoach_shared/parent_pin` document need Firestore rules. Add to the existing rules:
```
match /spellcoach_activity/{doc} {
  allow read, write: if request.auth != null;
}
```
The `spellcoach_shared/{doc}` rule should already cover `parent_pin` if the wildcard match was set up previously.

### 2026-04-23 — Session 6 (Build & Deploy — prior session)
- Earlier session verified build but deployed stale `dist/` from April 21 (deployed in 1s — no new code)

### 2026-04-23 — Session 7 (5 New Features + Successful Deploy)
- **Discovered stale deploy issue**: `dist/` folder was from April 21, but `App.tsx` had been updated today with 5 new features. Previous deploy pushed old files.
- **Fresh build**: Ran `npx vite build --outDir dist-fresh` (old `dist/` had locked files preventing overwrite). Build succeeded: index.html + CSS + JS (768KB bundle).
- Copied `netlify.toml` into `dist-fresh/` for SPA redirects.
- **Erin manually deployed** `dist-fresh/` via Netlify drag-and-drop from Finder. Deploy successful.
- **5 new features now live:**
  1. **Student Streak Calendar on Dashboard** — 30-day grid with checkmarks for quiz/practice days, streak counter, motivational messages ("You're on fire!" at 7+ days, etc.)
  2. **Missed Words Cloud Sync** — missed words now sync to Firestore (`spellcoach_shared`) in real time, visible across devices
  3. **Word Search Remix = New Words** — remix button picks entirely new random words from the full word pool (uses `fullWordPool` prop), not just reshuffling the same words
  4. **Bigger Puzzles** — Regular: 10 words on 12×12 grid (was 5/10×10), Challenge: 12 words on 16×16 grid (was 8/14×14)
  5. **Missed Words Auto-Remove** — words spelled correctly during "Practice These" are automatically removed from missed list, plus a "Clear All" button added
- **Build artifact**: `dist-fresh/` folder in SpellCoach directory (3 items: assets/, index.html, netlify.toml)
- **GitHub still not updated** — needs manual setup

### 2026-05-05 — Session 9 (Example Sentence Button Fix + Gemini Integration)
- **Bug Zaiden reported**: in Quiz mode, the "Example Sentence" button (speech-bubble icon) did nothing when tapped. Repeat and Slow buttons worked fine.
- **Root cause**: button was hardcoded `disabled={!details.ex}`. For any word not in the built-in DICTIONARY (i.e. any custom word added to MyLists, including homophones like rain/reign), `details.ex` was empty, so the button silently disabled itself with no visible feedback.
- **Why we couldn't just hardcode a fallback like "The word is X"**: Erin specifically needs real, contextual sentences so Zaiden can hear which word is meant when sounding out (homophones — rain/reign, their/there, etc.). A generic carrier sentence doesn't disambiguate.
- **Fix shipped**: real example sentences for ALL words via Gemini, with the API key kept fully off the client.
  1. **Netlify Function added** (`netlify/functions/sentence.js`): server-side proxy. Reads `GEMINI_API_KEY` from Netlify env vars, calls `gemini-2.5-flash` with a kid-appropriate prompt ("12 words or fewer, clear context for homophones, grade-school vocab"), returns `{ sentence }`. 8s timeout, basic input validation.
  2. **vite.config.ts cleaned up**: REMOVED the `define: { 'process.env.GEMINI_API_KEY': ... }` line that was baking the key into the JS bundle. This was the leak vector that got the key auto-revoked previously. Key now lives ONLY as a Netlify env var.
  3. **App.tsx — Quiz component**: added `sentenceCache` (in-component Record) and `sentenceLoading` state. New `handleExampleSentence` function — speaks `details.ex` if it exists (dictionary words, instant), else cached sentence (instant on re-tap), else fetches from `/.netlify/functions/sentence?word=X`, caches it for the rest of the quiz session, and speaks it. Falls back to "The word is X." if the function errors. Button is now `disabled={sentenceLoading}` (only briefly during the fetch) instead of permanently disabled.
  4. **netlify.toml updated**: added `[functions] directory = "functions" node_bundler = "esbuild"` block.
- **Erin set the env var**: `GEMINI_API_KEY` (FocusBuddy key, AIzaSyBgGyy...) added in Netlify Site settings → Environment variables.
- **Verified no key leak**: built `dist-sentencefix/`, grepped for the Gemini key — clean. Only the Firebase web key remains in the bundle, which is public-by-design and safe.
- **Deploy folder**: `dist-sentencefix/` — contains assets/, index.html, netlify.toml, and functions/sentence.js. Drag-and-drop deploy.
- **Did NOT push to GitHub** — Erin asked to skip that this session.

## Next Steps
- [ ] **Erin to drag `dist-sentencefix/` into Netlify** to deploy this session's fix
- [ ] **Test the Example Sentence button** on Zaiden's device after deploy — try a dictionary word (instant), a custom word (~1-2s first tap, instant after), and homophones (rain/reign, their/there) to confirm Gemini differentiates them
- [ ] If the function returns errors, check Netlify Function logs (Site → Functions tab → sentence → Logs)
- [x] **Update Firestore rules** — `spellcoach_activity` rule already exists (confirmed 2026-04-23, lines 40-46 in Firestore rules)
- [ ] Test all 5 Session 7 features on Zaiden's device
- [ ] Test missed words cloud sync — verify changes appear on Erin's device in real time
- [ ] Test streak calendar — complete a quiz and verify the checkmark appears
- [ ] **Set up GitHub remote** — still no remote configured, no commits. Need manual `git init` + remote setup.
- [ ] Consider: cross-device caching of generated sentences (Firestore doc) — currently per-quiz-session only. Each new quiz re-fetches custom-word sentences. Cheap (Gemini Flash, short prompt), but Firestore cache would be free + instant.
- [ ] Consider: daily reminder/notification system (future feature)
- [ ] Consider: assigning specific lists for Zaiden to complete (future feature)
- [ ] Consider: background color tweak (Erin mentioned "more dark purple, less black" in earlier session)
- [ ] Clean up: old `dist/`, `dist-fresh/`, `dist-new/`, `dist-quietfix/` folders can be ignored; current deploy is `dist-sentencefix/`

## Known Issues
- TypeScript warning: `key` prop on Quiz/QuietPractice shows TS warning (non-blocking, React special prop)
- Firestore rules confirmed: `spellcoach_activity` rule is live (verified 2026-04-23)
- Git repo has no remote configured and no commits — need to set up GitHub connection
- Old `dist/` folder has locked files that can't be deleted (use `dist-fresh/` instead for future builds)
- Netlify CLI deploy from sandbox requires auth token (no automated deploy path yet — manual drag-and-drop from Finder works)
