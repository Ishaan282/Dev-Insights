# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev          # Start dev server (Next.js with Turbo)
bun run build        # Production build
bun run check        # Lint + TypeScript type check (run before committing)
bun run lint:fix     # Auto-fix ESLint issues
bun run format:write # Auto-format with Prettier

bun run db:generate  # Generate Prisma client after schema changes
bun run db:migrate   # Run migrations (dev)
bun run db:push      # Push schema changes without migration (prototype)
bun run db:studio    # Open Prisma Studio
```

## Architecture

**Dev-Insights** is an AI-powered platform for understanding GitHub repositories — it indexes codebases with vector embeddings and uses Gemini AI to answer natural language questions, summarize commits, and transcribe meetings.

### Stack

- **Next.js 15 App Router** with React Server Components and tRPC for type-safe API calls
- **Prisma + PostgreSQL** (Neon/Supabase) with `pgvector` extension for 768-dim semantic search
- **Clerk** for authentication (middleware in `src/middleware.ts`)
- **Google Gemini** for AI summaries and embeddings (`src/lib/gemini.ts`)
- **GitHub API** via Octokit (`src/lib/github.ts`, `src/lib/github-loader.ts`)
- **AssemblyAI** for meeting transcription (`src/lib/assembly.ts`)
- **Stripe** for billing (`src/lib/stripe.ts`)

### Key Patterns

**tRPC setup**: Routers live in `src/server/api/routers/`. The root router is `src/server/api/root.ts`. Protected procedures use Clerk auth via `protectedProcedure` in `src/server/api/trpc.ts`. Database access is `ctx.db` (Prisma singleton from `src/server/db.ts`).

**Client vs Server tRPC**: Use `src/trpc/react.tsx` (`api` export) in client components and `src/trpc/server.ts` (`api` export) in server components/RSC.

**Auth-required routes**: All pages under `src/app/(protected)/` require Clerk session. The `useProject()` hook (`src/hooks/use-project.tsx`) provides the active project from localStorage across the app.

### Core Data Flows

**Project indexing** (`projectRouter.createProject`): GitHub URL → credit check → create DB records → `indexGithubRepo()` (LangChain loader → Gemini file summaries → vector embeddings stored as `SourceCodeEmbedding`) + `pollCommits()` (GitHub diffs → Gemini summaries stored as `Commit`).

**Q&A** (`/qa` page): User question → Gemini embedding → pgvector similarity search on `SourceCodeEmbedding` → Gemini answer with file references → saved as `Question`.

**Meetings** (`/meetings` page): Upload to Supabase storage → AssemblyAI transcription → Gemini issue extraction → stored as `Meeting` + `Issue` records.

### Environment Variables

See `.env.example` for all required keys: `DATABASE_URL`, Clerk keys, `GITHUB_TOKEN`, `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`, `ASSEMBLYAI_API_KEY`, Stripe keys.
