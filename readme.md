# TalentForge AI — ATS Resume Intelligence Platform

**TalentForge AI** is a powerful resume analysis and optimization platform that leverages AI to help students, professionals, and career coaches optimize their resumes for ATS (Applicant Tracking Systems) and match them against job descriptions.

## 🎯 Features

- **ATS Score Analysis** - Score your resume against ATS parsing algorithms
- **Job Description Matching** - Compare your resume against target job descriptions  
- **Missing Keywords Detection** - Identify important keywords and phrases you're missing
- **Resume Rewriting** - AI-powered suggestions to improve weak sections
- **Resume Health Score** - Overall resume quality assessment
- **Dashboard Preview** - Beautiful, intuitive interface for reviewing analysis results

## 🛠️ Tech Stack

**Frontend:**
- [React 19](https://react.dev/) - UI framework
- [TanStack Router](https://tanstack.com/router) - Type-safe routing
- [TanStack Query (React Query)](https://tanstack.com/query) - Data fetching & caching
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Headless UI components
- [React Hook Form](https://react-hook-form.com/) - Form state management
- [Zod](https://zod.dev/) - TypeScript-first schema validation

**Build & Dev:**
- [Vite](https://vitejs.dev/) - Lightning-fast build tool
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [ESLint](https://eslint.org/) - Code linting
- [Prettier](https://prettier.io/) - Code formatting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/prithvishshukla/recruit-optimize-ai.git
cd recruit-optimize-ai
```

2. **Install dependencies:**
```bash
npm install
```

### Development

Start the development server with hot module reloading:

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Production Build

Build the project for production:

```bash
npm run build
```

This generates optimized assets in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## 📁 Detailed Project Structure

```text
recruit-optimize-ai/
├── supabase/                  # Supabase custom migrations, seed scripts & DB schemas
├── src/
│   ├── assets/                # Static assets, branding files & logos
│   │   └── talentforge-logo.png
│   ├── components/            # Reusable React components
│   │   ├── auth/              # Form boundaries, oauth helpers & auth layout templates
│   │   │   ├── auth-divider.tsx
│   │   │   ├── auth-page-layout.tsx
│   │   │   └── google-sign-in-button.tsx
│   │   ├── ui/                # shadcn / Radix UI accessible styled primitives
│   │   │   ├── accordion.tsx  # Collapsible FAQs accordion list
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── avatar.tsx     # Initials fallback & URL user photo shell
│   │   │   ├── card.tsx
│   │   │   ├── dropdown-menu.tsx # Radix dropdown trigger overlay wrapper
│   │   │   ├── form.tsx       # Schema forms helper (uses react-hook-form)
│   │   │   ├── input.tsx
│   │   │   ├── sidebar.tsx    # Dashboard core navigation panel
│   │   │   └── sonner.tsx     # Toast notification dispatcher
│   │   ├── config-warning-banner.tsx  # Dynamic validation banner for API credentials
│   │   └── global-error-boundary.tsx # Fallback view for catching React runtimes crashes
│   ├── contexts/
│   │   └── auth-context.tsx   # Singleton AuthProvider state (Supabase PKCE Auth Context)
│   ├── hooks/
│   │   └── use-mobile.tsx     # Window width dimension tracking hook
│   ├── lib/
│   │   ├── db.ts              # Unified Database actions + automatic LocalStorage simulation fallbacks
│   │   ├── error-capture.ts   # Client-side exception tracing logs helper
│   │   ├── gemini.ts          # Google Gemini 2.5 Flash SDK prompt schemas & mock fallbacks
│   │   ├── resumeParser.ts    # Web Worker-based PDF.js client text extractor CDN loading
│   │   ├── supabase.ts        # Supabase Client setup, persistence config, and oauth triggers
│   │   └── utils.ts           # Classnames utility (Tailwind CSS parser/merger)
│   ├── routes/                # Page route views (TanStack router files)
│   │   ├── auth/
│   │   │   └── callback.tsx   # OAuth redirect handler (PKCE verifier receiver)
│   │   ├── dashboard/         # Protected candidates features
│   │   │   ├── admin.tsx      # Admin stats panel and payment logs review
│   │   │   ├── analyze.tsx    # File dropzone & JD text input comparator
│   │   │   ├── history.tsx    # Scoring version histories & optimization deltas list
│   │   │   ├── index.tsx      # Candidate home dashboard portal index
│   │   │   └── report.$reportId.tsx # Dynamic interactive ATS keyword scoring report
│   │   ├── __root.tsx         # Root meta layout loaders
│   │   ├── dashboard.tsx      # Protected route session-checking wrapper layout
│   │   ├── index.tsx          # Main Landing Page containing header Nav & CTAs
│   │   ├── login.tsx          # User credential auth page
│   │   ├── price.tsx          # Pricing subscription upgrades & Razorpay handler
│   │   └── signup.tsx         # Account registration page
│   ├── client.tsx             # Application entry loader (React strict DOM mounting)
│   ├── router.tsx             # Router setup configuration
│   ├── server.ts              # Server-side setup outline
│   └── styles.css             # Theme colors, glassmorphism tokens, and fonts
├── index.html                 # Index page DOM parent shell
├── vite.config.ts             # Vite configuration using Tailwind CSS v4 compiler
├── tsconfig.json              # TypeScript compilation rules
├── eslint.config.js           # Lint code guidelines
├── package.json               # Development scripts & project dependencies
└── README.md                  # Detailed documentation guide
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## 🔄 Recent Changes

**Lovable Removal (v1.0.0):**
- ✅ Removed all `@lovable.dev` dependencies
- ✅ Created standalone Vite configuration
- ✅ Implemented client-side rendering setup
- ✅ Added proper CSS/Tailwind loading
- ✅ Project now 100% independent

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

## 🎨 Design System

The project uses a custom design system with:
- **Colors:** Warm ivory background, charcoal type, muted teal, soft coral, muted gold
- **Typography:** Inter (body), Plus Jakarta Sans (display)
- **Spacing:** 4px base unit with responsive breakpoints
- **Components:** Radix UI primitives with custom styling

## 📦 Environment Setup

The project is configured to work with:
- **Node.js:** v18 or higher
- **Package Manager:** npm (v9+) or yarn
- **TypeScript:** v5.8+
- **Vite:** v8.0+

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## 📄 License

This project is private. All rights reserved.

## 👤 Author

**Prithvish Shukla**
- GitHub: [@prithvishshukla](https://github.com/prithvishshukla)

## 📧 Support

For issues, questions, or feedback, please open an issue on the GitHub repository.

---

**Built with ❤️ for career optimization**
