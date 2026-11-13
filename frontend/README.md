# SkillScan.AI — Frontend

This is the Next.js frontend for **SkillScan.AI**, an intelligent resume screening and candidate ranking application.

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Vercel-success?style=for-the-badge&logo=vercel&logoColor=white)](https://ai-powered-resume-screener-flame.vercel.app/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16%20(App%20Router)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

---

## Tech Stack & Architecture

- **Next.js 16 (App Router)** + **React 19** + **TypeScript**
- **Tailwind CSS 4** with CSS variable design tokens
- **Typography:** `Hanken Grotesk` via `next/font/google` with tabular numeric alignments
- **Icons:** `lucide-react`
- **State & Storage:** Resilient local storage with `useSyncExternalStore` for theme switching, and non-blocking toast notifications.

---

## Local Development

From the `frontend/` directory:

```bash
# 1. Install dependencies
npm install

# 2. Set backend endpoint (optional, defaults to http://127.0.0.1:5000)
cp .env.local.example .env.local

# 3. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL of the Flask REST backend API | `http://127.0.0.1:5000` |

---

## Deployment (Vercel)

When deploying this frontend on Vercel:
1. Connect your repository to Vercel.
2. Set **Root Directory** to `frontend`.
3. Add the `NEXT_PUBLIC_API_URL` environment variable pointing to your deployed Flask backend.
4. Deploy!

For complete project documentation, architecture diagrams, and backend setup, see the [Root README](../README.md).
