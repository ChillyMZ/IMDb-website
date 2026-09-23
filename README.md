# ChillyMZ

ChillyMZ is a chapter-by-chapter book rating and discussion platform: rate every chapter, see the story curve, compare with other readers, and talk about the book.

## Current architecture

The cutover build is a static Next.js export hosted with GitHub Pages. Browser requests are routed to Supabase Edge Functions for authenticated reads and writes.

- Frontend: Next.js / React static export
- Hosting: GitHub Pages
- Authentication: Supabase Auth
- Database: private `chillymz` schema in Supabase Postgres
- API: Supabase Edge Functions
- Uploaded covers: private Supabase Storage bucket
- Legacy bundled covers: `public/covers`
- Analytics: first-party, consent-aware aggregate metrics

The browser does not receive direct table access. The API verifies identity server-side and applies ownership, moderation, chapter bounds and rate limits.

## Local development

Node.js 22.13+ and npm are required.

```sh
npm ci
npm run dev
```

For a production-style static export:

```sh
GITHUB_ACTIONS=true npx next build
```

The generated site is written to `out/`.

## Deployment

`.github/workflows/deploy-pages.yml` builds and deploys `main` to GitHub Pages. The Supabase cutover is kept on `supabase-cutover` until the owner Auth account, admin link and final tests are complete.

See `LAUNCH_CHECKLIST.md` for the exact cutover checklist.

## Safety and privacy

Ratings, profiles, discussions, replies, moderation cases and account actions go through the API rather than direct browser table access. Community tools include reporting, blocking/muting, moderation holds and appeals.

Search indexing remains disabled until the public launch is verified.

## Repository notes

Some legacy server files remain temporarily for migration history and rollback context. New production work should target the static/Supabase architecture rather than the old Cloudflare/Sites backend.
