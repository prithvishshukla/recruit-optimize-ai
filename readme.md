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

## 📁 Project Structure

```
recruit-optimize-ai/
├── src/
│   ├── components/         # Reusable UI components
│   │   └── ui/            # Radix UI component wrappers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions & helpers
│   ├── routes/            # Page components & routing
│   ├── assets/            # Images and static files
│   ├── client.tsx         # Client entry point
│   ├── styles.css         # Global styles & Tailwind
│   └── router.tsx         # Router configuration
├── index.html             # HTML entry point
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── eslint.config.js       # ESLint configuration
├── package.json           # Dependencies & scripts
└── README.md              # This file
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
