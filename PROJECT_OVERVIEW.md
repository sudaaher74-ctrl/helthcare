# Sankalp — Your Personal Life Operating System

**Sankalp** ("resolution / determination" in Sanskrit) is an AI-powered, all-in-one
personal life-tracking platform. Where most apps track *one* thing — food, or workouts,
or money — Sankalp unifies **health, fitness, nutrition, sleep, productivity, finance,
habits, and goals** into a single connected system, and layers AI and game mechanics on
top to keep users coming back.

---

## 1. What the Project Is

A full-stack web application built as a "life operating system" for an individual. Every
domain of daily life is a **pillar**, and all pillars feed one dashboard, one streak
engine, one XP/level system, and one cross-pillar AI insight layer.

### The Pillars (Core Feature Modules)

| Pillar | What it does |
|---|---|
| **Dashboard** | A single daily "command center" — health score ring, macros, streaks, tasks, and quick-log actions in one view. |
| **Nutrition** | Meal & food logging with macros (calories, protein, carbs, fat, fiber, sugar, sodium), water tracking, and **AI photo-based food analysis**. |
| **Workout Tracker** | Sessions, exercises, sets/reps/weight, PR (personal record) flags, calories burned, mood, and a visual **muscle map**. |
| **Gym Planner** | A weekly (Mon–Sat) training split with **step-by-step "how to perform" guidance** and form tips baked into every exercise. |
| **Sleep** | Bed/wake times, duration, quality, deep & REM sleep, and awakenings. |
| **Weight & Body** | Weight, body-fat %, and muscle-mass trends over time. |
| **Habits** | Daily/weekly habits with categories, icons, reminders, and completion logs. |
| **Tasks & Time** | Kanban-style task board (Backlog → In Progress → Review → Done) with time-logging. |
| **Goals** | Long-term goals with measurable targets and milestone breakdowns. |
| **Finance** | Expense tracking with **automatic bank/UPI SMS parsing** and AI categorization. |
| **Calendar & Analytics** | Unified calendar plus trend analytics across every pillar. |
| **Achievements & Streaks** | Gamified rewards, rarity tiers, XP, levels, and streak freezes. |
| **Daily Check-in** | A one-tap mood + notes log to correlate feelings against behavior. |

---

## 2. Technical Architecture & Key Functions

**Frontend** — React 19 + TypeScript, Vite, Tailwind CSS v4, Radix UI primitives,
Framer Motion animations, TanStack Query (server state), Zustand (client state),
Recharts (data viz), React Hook Form + Zod (validation). Deployed on Vercel.

**Backend** — Node.js + Express + TypeScript, Prisma ORM over MongoDB, JWT auth with
refresh tokens, Google OAuth (Passport), Cloudinary for image uploads. Hardened with
Helmet, CORS, rate limiting, and compression.

### Notable engineering functions

- **Pluggable AI provider layer** (`foodAnalyzer.ts`) — a provider interface with an
  OpenAI GPT-4o Vision implementation *and* a graceful **mock fallback**, so the app
  fully works in demos/offline without an API key and degrades safely if the AI call
  fails.
- **Bank/UPI SMS parser** (`parseSms.ts`) — regex engine that reads Indian bank & UPI
  transaction texts (HDFC, SBI, ICICI, Axis, Kotak, GPay, PhonePe, Paytm), extracts
  amount / direction / merchant / reference, and generates a **stable dedupe key** so the
  same transaction is never double-counted.
- **Voice command / NLP intent parser** — natural-language input ("I spent 200 on food",
  "log 500ml water", "chest workout") is parsed to an intent and **executed automatically**
  (creates the expense, water log, task, or plans the workout).
- **XP & leveling engine** — exponential level scaling (`1000 × 1.5^(level−1)`) with
  automatic level-up carry-over.
- **Streak engine with freezes** — per-domain streaks (habit, workout, diet, sleep,
  productivity) with a "freeze" grace mechanic so one missed day doesn't destroy momentum.
- **Cross-pillar analytics** — a single endpoint aggregates weight, sleep, habits,
  workouts, and nutrition into correlated daily trends.

---

## 3. What We Do Differently From Competitors

| Competitor category | Their limitation | Sankalp's difference |
|---|---|---|
| **MyFitnessPal / Cronometer** (nutrition) | Food only; siloed | Nutrition is *one* pillar inside a whole-life system |
| **Strong / Hevy** (workouts) | Lifting logs only | Workouts + guided planner + muscle map + everything else |
| **Habitica / Streaks** (habits) | Habits/gamification only | Same gamification, but powered by *real* health & finance data |
| **Walnut / Money Manager** (finance) | Money only | Finance correlated with mood, stress, and habits |
| **Whoop / Oura** (recovery) | Hardware-dependent | Software-only, no wearable required |

**The four genuine differentiators:**

1. **Unified "Life OS," not a single-purpose tracker.** The moat is *correlation* —
   e.g., "You skip workouts on days you sleep under 6 hours," or "Your food-delivery
   spend jumps on high-stress, low-habit days." No single-vertical competitor can see
   these connections because they only hold one slice of the user's life.

2. **AI that acts, not just displays.** Snap a photo → macros logged. Speak a sentence →
   the expense/task/workout is created for you. AI removes the #1 reason people quit
   trackers: **manual data entry.**

3. **Automatic finance capture via SMS parsing.** Expenses are read from bank/UPI
   messages and auto-categorized — near-zero-effort finance tracking, tuned for the
   Indian banking/UPI ecosystem.

4. **Guided coaching built in.** The gym planner ships step-by-step form instructions and
   tips per exercise — it's a coach, not just a logbook, so beginners aren't left guessing.

**Resilience by design:** the AI provider abstraction with a mock fallback means the
product never breaks when an API key is missing or a call fails — a reliability edge over
AI-first apps that hard-fail without their model.

---

## 4. Business Strengths

- **Massive engagement surface.** ~14 feature modules = many daily reasons to open the
  app. More touchpoints → higher retention → stronger monetization.
- **Compounding data moat.** Every logged day makes the cross-pillar insights smarter and
  more personal. Switching cost rises over time — users can't easily recreate their
  history elsewhere.
- **High retention mechanics.** Streaks, streak-freezes, XP, levels, achievement rarity
  tiers, and daily mood check-ins are proven habit loops that keep people returning.
- **Clear premium tier.** Free = manual tracking; **Premium = AI food photos, voice
  logging, auto-SMS finance, and deep cross-pillar insights.** The AI features are the
  natural paywall.
- **India-first, globally scalable.** UPI/SMS parsing and INR handling fit a huge,
  fast-growing market underserved by US-centric apps, while the architecture generalizes
  to any region.
- **Low operating cost / capital-efficient.** No wearable hardware; pluggable AI keeps
  inference costs controllable and swappable between vendors.
- **Cross-sell & partnership ready.** Because Sankalp holds fitness, nutrition, *and*
  spending data, it's positioned for gym, supplement, insurance, and fintech
  partnerships that single-vertical apps can't credibly offer.
- **Modern, defensible tech stack.** TypeScript end-to-end, clean modular architecture,
  and safe-degradation patterns make the platform fast to extend and reliable to run.

---

## 5. One-Line Pitch

> **Sankalp is the single app that runs your entire life** — health, fitness, money,
> habits, and goals — using AI to log for you and to reveal the hidden connections between
> how you sleep, train, eat, spend, and feel, so you actually improve instead of just
> tracking.
