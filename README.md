# AI Cover Letter Generator

AI-powered cover letter generator with brutally honest recruiter feedback. Built with React 19, TypeScript, Tailwind CSS v4, and the Anthropic API.![CI](https://github.com/mpokala-dev/cover-letter-gen/actions/workflows/ci.yml/badge.svg)

## Features

- **Tailored cover letters** generated from your CV and the job description
- **Honest recruiter feedback** — unfiltered assessment from a 10-year senior recruiter persona
- **PDF upload** — upload your CV as a PDF, parsed via the Anthropic document API
- **Tone control** — Formal (default), Friendly, or Bold
- **Tweak & regenerate** — refine with a plain-English instruction
- **Copy & download** — clipboard or `.txt` file
- **Secure API** — key lives server-side in a Vercel Edge Function

## Tech Stack

- React 19 + TypeScript strict mode
- Vite 6 + Tailwind CSS v4
- Anthropic SDK (claude-sonnet-4-20250514)
- Vercel Edge Functions
- Vitest + Testing Library (42 tests, ~79% coverage)
- GitHub Actions CI

## Getting Started

```bash
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

## Deployment (Vercel)

1. Push to GitHub
2. Import repo in Vercel
3. Add `ANTHROPIC_API_KEY` in Project → Settings → Environment Variables
4. Deploy

## Scripts

```bash
npm run dev        # Start dev server
npm test           # Run tests
npm run coverage   # Tests with coverage report
npm run typecheck  # TypeScript type check
npm run build      # Production build
```

## Project Structure

```
src/
  components/
    ToneSelector.tsx    # Tone toggle
    PdfUpload.tsx       # PDF upload zone
    LetterResult.tsx    # Output, feedback, stats, tweak
  hooks/
    useCoverLetter.ts   # All generation state and logic
  utils/
    api.ts              # Fetch wrapper for /api/generate
    text.ts             # wordCount, readingTime, download, base64
  types/
    index.ts            # Shared types and constants
  test/                 # Vitest test files
api/
  generate.ts           # Vercel Edge Function
```
