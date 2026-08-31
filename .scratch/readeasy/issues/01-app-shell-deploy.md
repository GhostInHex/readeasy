# 01: App shell + deploy pipeline

**What to build:** The ReadEasy app, deployable and empty. Landing screen with tagline "ReadEasy — the web, made readable for every reader.", an input card with two tabs (URL / raw text), a Transform button (wired to a route that returns a stub response), and a split-screen layout with left and right placeholder panels. Deploy pipeline to Vercel working.

**Blocked by:** None (can start immediately).

**Files you touch:** everything (greenfield scaffold). Later tickets restrict themselves.

**Status:** done (except the Vercel deploy step, which needs the builder's Vercel login)

- [x] Next.js + TypeScript app runs locally
- [x] Landing screen renders tagline and input card with URL/raw-text tabs
- [x] Transform button posts to the transform route and receives a stub JSON response
- [x] Split-screen shell renders with two placeholder panels
- [ ] App deploys to Vercel and the live URL loads — **blocked on human action.** The project is
      deploy-ready (stock Next.js App Router, no DB/auth, `.env.example` + README steps, production
      build and `next start` verified). Running `vercel link` / `vercel --prod` needs an interactive
      Vercel login, so the builder must run it.
- [x] Repo has a README pointing to `.scratch/readeasy/SPEC.md`

**Notes for later tickets**

- Test runner: `npm test` → `node --import tsx --test tests/*.test.ts`. `tsx` resolves the `@/*` tsconfig
  paths, so tests import app modules exactly the way the app does.
- Pinned `next@15.5.25` + `react@19.2.8`: the scaffolded `next@15.0.0` does not accept React 19 stable.
- `npm audit` reports a high-severity advisory in the `postcss` version bundled inside `next@15.x`. It is a
  build-time dependency and only `next@16` fixes it; staying on 15.5.25 for the hackathon.
