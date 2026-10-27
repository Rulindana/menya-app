# Contributing to Menya Ikinyarwanda 🇷🇼

Murakaza neza! Thank you for helping build **Menya**, an interactive Kinyarwanda language and Rwandan cultural learning platform built with **Expo + React Native + TypeScript**.

This guide is designed so any contributor can clone the repository, run the app, validate Kinyarwanda linguistic accuracy, and submit a pull request in minutes.

---

## 1. Quick Start (Under 2 Minutes)

### Prerequisites
- **Node.js** `>= 20.x` and **npm**
- **Expo Go** app on your iOS/Android phone (or Android Studio / Xcode emulator)

### Setup & Run
```bash
# 1. Clone the repository
git clone https://github.com/Rulindana/menya-app.git
cd menya-app

# 2. Install dependencies
npm install

# 3. Run the automated verification suite (20 tests + Kinyarwanda dictionary validator)
npm test

# 4. Start the Expo development server
npx expo start
```

> [!TIP]
> You do **not** need any secret keys or custom keystore files to run or build the project locally. If you run a local Android release build without a production keystore, `android/app/build.gradle` automatically falls back to `debug.keystore`.

---

## 2. Project Structure

```text
menya-app/
├── App.tsx                        # App entry point, Plus Jakarta Sans font loader & providers
├── assets/                        # App icons, splash assets & animated README SVGs
├── scripts/
│   ├── verifyAll.js               # 3-suite automated test runner (Store, Journey, Dictionary)
│   ├── validateKinyarwanda.js     # Validates all Kinyarwanda words against Iriza dictionary
│   └── checkAnswers.js            # Verifies every exercise has a solvable answer in its options
└── src/
    ├── components/
    │   ├── AvatarPicker.tsx       # Custom photo + emoji avatar picker & AvatarBadge
    │   ├── journey/JourneyPath.tsx# Duolingo-style winding unit & lesson path
    │   ├── layout/ScreenHeader.tsx# Shared screen header with progress bar
    │   └── ui/                    # AppText, AppIcon, InteractiveOptionCard, etc.
    ├── data/
    │   ├── lessons.ts             # 14 themed units & 63 authored Kinyarwanda lessons
    │   ├── questionBank.ts        # Dynamic reinforcement pools & WORD_PAIRS
    │   ├── stories.ts             # Bilingual Kinyarwanda stories with comprehension quizzes
    │   ├── culturalTips.ts        # Rwandan cultural etiquette & grammar notes per unit
    │   ├── gameQuestions.ts       # Ibisakuzo (traditional riddles) & AI opponent logic
    │   └── wordOfTheDay.ts        # Daily Kinyarwanda vocabulary rotation
    ├── firebase/
    │   ├── config.ts              # Firebase Auth & Firestore setup
    │   └── syncService.ts         # Cloud sync, leaderboard & multiplayer rooms
    ├── navigation/
    │   └── AppNavigator.tsx       # Auth stack, onboarding gate & bottom tab navigator
    ├── screens/                   # LessonScreen, HomeScreen, GameScreen, StoriesScreen, ProfileScreen...
    ├── store/
    │   └── useAppStore.ts         # Zustand state store, XP/level engine & offline sync queue
    └── theme/
        ├── colors.ts              # Light & dark mode design tokens
        └── typography.ts          # Plus Jakarta Sans typography scale
```

---

## 3. Automated Quality Checks (Required Before PR)

Every contribution that modifies curriculum data, state logic, or lesson screens must pass all three automated verification scripts:

```bash
# Run the complete 3-suite verification harness (20 assertions)
npm test

# Validate Kinyarwanda vocabulary against the Iriza dictionary
npm run validate:kinyarwanda

# Verify all lesson and questionBank answers are solvable
npm run check:answers
```

### What `npm test` Verifies:
1. **Suite 1 — Store State & Offline Queue Integrity**: XP level boundaries (Levels 1–11), max-level progress safety, streak multipliers, heart regeneration, certificate unlock, avatar/photo switching, and offline sync queue mutations.
2. **Suite 2 — 4-Stage Lesson Journey Construction**: Verifies that every lesson across all 14 units produces a valid **Learn → Practice → Reinforce → Assessment** flow with solvable options.
3. **Suite 3 — Linguistic & Curriculum Integrity**: Validates Kinyarwanda vocabulary against the **Iriza Kinyarwanda Dictionary** (`0` unverified words) and ensures zero duplicate IDs across units, lessons, exercises, and stories.

---

## 4. Building an Android APK

### Option A: Expo EAS Cloud Build
```bash
npm run build:apk:eas
# or: npx eas-cli build --platform android --profile preview
```

### Option B: Local Gradle APK Build
Requires Android SDK configured (`ANDROID_HOME` or `android/local.properties`):
```bash
cd android
./gradlew assembleRelease
# Output APK: android/app/build/outputs/apk/release/app-release.apk
```

---

## 5. Submitting Changes

1. Create a feature branch (`git checkout -b feat/your-feature-name`).
2. Keep commits focused and use clear commit prefixes (`feat:`, `fix:`, `docs:`, `refactor:`).
3. Run `npm test` and ensure it exits with code `0`.
4. Open a Pull Request describing what changed and why.
