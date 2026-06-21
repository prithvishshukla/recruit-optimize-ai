# TalentForge AI — ATS Resume Intelligence Platform

**TalentForge AI** is a professional resume analysis and optimization platform that leverages Google Gemini AI to help candidates, job seekers, and career coaches optimize their resumes for Applicant Tracking Systems (ATS) and match them against target job descriptions.

---

## 🎯 Core Features

- **Recruiter-Grade ATS Score Audit** - Score resumes (0–100) against parser rules, formatting errors, and section layouts.
- **Job Description (JD) Semantic Matching** - Side-by-side breakdown comparing resumes against target job descriptions.
- **Keyword & Skill-Gap Analysis** - Automatic detection of missing keywords and phrases essential for passing ATS filters.
- **AI-Powered Section Rewriter** - Dynamic suggestions powered by Google Gemini to rewrite weak professional summaries and bullet points.
- **Interactive Bullet Point Optimizer** - Refine individual bullet points with action verbs and quantified achievements.
- **Historical Progress Tracking** - Compare versions (v1 → v4+) to see ATS score trends and fixed weaknesses.
- **Razorpay Subscription Gateway** - Fully functional pricing model with mock payment simulation for local testing.
- **PDF Report Exports** - High-fidelity, recruiter-ready PDF reports containing score summaries, keywords, and AI-optimized bullets.

---

## 🛠️ Architecture & Tech Stack

### Frontend & Build

- **[React 19](https://react.dev/)** - Declarative component UI framework.
- **[TanStack Router](https://tanstack.com/router)** - Safe, file-based routing architecture.
- **[TanStack Query](https://tanstack.com/query)** - Data fetching, queries, caching, and state synchronization.
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first styling with advanced styling engine.
- **[Radix UI Primitives](https://www.radix-ui.com/)** - Unstyled, accessible UI components.
- **[Recharts](https://recharts.org/)** - Responsive charts for visualizing score histories.
- **[Vite 8](https://vitejs.dev/)** - High-performance bundler and dev server.

### Core Services & Integrations

- **Google Gemini API (`gemini-2.5-flash`)** - Real-time AI analysis, evaluation, and rewrite suggestion prompts.
- **Supabase** - Authentication (PKCE Flow) and PostgreSQL database.
- **Cloudinary** - Secure cloud storage for resume PDF documents.
- **PDF.js** - Client-side worker-based script loader to extract text from PDFs.
- **Razorpay Checkout API** - Seamless user payment integrations.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/prithvishshukla/recruit-optimize-ai.git
cd recruit-optimize-ai
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory by copying the example environment file:

```bash
cp .env.example .env
```

Fill in the required configurations:

| Variable                        | Description                       | Source                                                |
| :------------------------------ | :-------------------------------- | :---------------------------------------------------- |
| `VITE_SUPABASE_URL`             | Supabase Project Host URL         | [Supabase Console](https://database.supabase.com/)    |
| `VITE_SUPABASE_ANON_KEY`        | Supabase Anon/Publishable API Key | [Supabase Console](https://database.supabase.com/)    |
| `VITE_CLOUDINARY_CLOUD_NAME`    | Cloudinary Account Identifier     | [Cloudinary Settings](https://cloudinary.com/)        |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned Upload Preset name       | [Cloudinary Upload Settings](https://cloudinary.com/) |
| `VITE_GEMINI_API_KEY`           | Google Gemini API Key             | [Google AI Studio](https://aistudio.google.com/)      |
| `VITE_RAZORPAY_KEY_ID`          | Razorpay Public Checkout Key      | [Razorpay Dashboard](https://razorpay.com/)           |

> [!TIP]
> **Simulation Mode:** If keys/credentials are missing or remain default placeholders, the application will fallback to **Simulation Mode** (mocking AI analysis and Razorpay checkout triggers) so you can test all features offline.

### 3. Database Setup (Supabase)

To initialize your database tables, index constraints, and Row Level Security policies:

1. Log in to your [Supabase Console](https://database.supabase.com/).
2. Open the **SQL Editor** for your project.
3. Paste and run the database schema queries defined in [`supabase/schema.sql`](file:///d:/recruit-optimize-ai/supabase/schema.sql).
4. Verify that Row Level Security (RLS) is active for all created tables.

### 4. Running Locally

Start the development server with hot reload:

```bash
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## 🔄 Recent Changes

**Lovable Removal (v1.0.0):**

- ✅ Removed all `@lovable.dev` dependencies
- ✅ Created standalone Vite configuration
- ✅ Implemented client-side rendering setup
- ✅ Added proper CSS/Tailwind loading
- ✅ Project now 100% independent

---

## 📁 Project Directory Structure

```text
recruit-optimize-ai/
├── supabase/                  # Database migration queries and RLS setups
│   └── schema.sql
├── src/
│   ├── assets/                # Branding assets, logo templates
│   ├── components/            # Shared React components
│   │   ├── auth/              # OAuth boundaries and page layout shells
│   │   ├── ui/                # Styled Shadcn / Radix primitives (button, dropdowns, table, etc.)
│   │   ├── config-warning-banner.tsx
│   │   └── global-error-boundary.tsx
│   ├── contexts/
│   │   └── auth-context.tsx   # Supabase PKCE session provider
│   ├── hooks/
│   │   └── use-mobile.tsx     # Window width tracker hook
│   ├── lib/
│   │   ├── db.ts              # Unified Database actions with LocalStorage mock fallbacks
│   │   ├── error-capture.ts   # Exception logger utilities
│   │   ├── gemini.ts          # Google Gemini 2.5 API integration and mock responses
│   │   ├── resumeParser.ts    # PDF.js worker parser loader
│   │   ├── supabase.ts        # Client instance and PKCE setups
│   │   └── utils.ts           # Class utilities (Tailwind merges)
│   ├── routes/                # File-based router path views (TanStack Start structure)
│   │   ├── auth/
│   │   │   └── callback.tsx   # OAuth PKCE Redirect verifier
│   │   ├── dashboard/         # Protected feature workspaces
│   │   │   ├── admin.tsx      # Admin logs and dashboard
│   │   │   ├── analyze.tsx    # Upload zone and Job Description matching
│   │   │   ├── history.tsx    # Version lists and trends
│   │   │   ├── index.tsx      # Dashboard index
│   │   │   └── report.$reportId.tsx # Custom scoring report analysis
│   │   ├── __root.tsx         # Route root loader shell
│   │   ├── dashboard.tsx      # Protected router layout
│   │   ├── index.tsx          # Landing Showcase page
│   │   ├── login.tsx          # Sign-in panel
│   │   ├── price.tsx          # Premium Upgrade workflows
│   │   └── signup.tsx         # Sign-up panel
│   ├── client.tsx             # Main entry loader mounting to index.html
│   ├── router.tsx             # Router setup configurations
│   └── styles.css             # Unified CSS design variables
├── index.html                 # Parent DOM page
├── vite.config.ts             # Vite configuration using Tailwind CSS v4 compiler
├── tsconfig.json              # TypeScript rules
├── eslint.config.js           # ESLint configuration
└── package.json               # Package configurations and scripts
```

---

## ⚙️ Available Scripts

| Script              | Description                                   |
| :------------------ | :-------------------------------------------- |
| `npm run dev`       | Runs the client-side server locally           |
| `npm run build`     | Builds optimized static assets inside `/dist` |
| `npm run build:dev` | Compiles code in development mode             |
| `npm run preview`   | Runs the production preview build             |
| `npm run lint`      | Inspects code for syntax and type issues      |
| `npm run format`    | Prettifies code styling formats               |

---

## 🎨 Design System

The project uses a custom design system with:

- **Colors:** Warm ivory background, charcoal type, muted teal, soft coral, muted gold
- **Typography:** Inter (body), Plus Jakarta Sans (display)
- **Spacing:** 4px base unit with responsive breakpoints
- **Components:** Radix UI primitives with custom styling

---

## 🛡️ License

This project is private and proprietary. All rights reserved.

---

**Developed with ❤️ for TalentForge Career Optimizations**
