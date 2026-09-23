# Supabase migration status

The existing Sites deployment remains the live application. The migration is isolated on the `supabase-cutover` branch until owner authentication, final data reconciliation, and the public switch are verified.

## Completed

- Created the Supabase project and protected `chillymz` schema.
- Copied the initial live database snapshot: 30 books, 7 ratings, 1 profile, 1 discussion, 1 reply, 2 moderation cases, and 1 moderation event.
- Preserved legacy record IDs. No legacy identity has been reassigned by display name.
- All 15 application tables have RLS enabled. `anon` and `authenticated` still have no direct table access; browser traffic goes through verified Edge Functions.
- Added atomic server-side rate limiting and authenticated reader-profile bootstrap functions.
- Added the private `covers` Storage bucket for future uploaded covers. The five legacy Project Gutenberg covers remain versioned static assets in `public/covers`, so no legacy image object is missing from Storage.
- Deployed `chillymz-api` for catalogue, ratings, profiles, submissions, chapter reviews, community, cover delivery, moderation, and book editing.
- Deployed `chillymz-admin` for owner checks and bulk catalogue import.
- Deployed `chillymz-analytics` with corrected aggregate counts.
- Replaced Sites/ChatGPT sign-in code on the cutover branch with Supabase email/password auth and token refresh.
- Added a browser API bridge so the existing UI can use the Supabase functions without rewriting every component.
- Converted the cutover branch to a static Next.js export compatible with GitHub Pages, including the `/IMDb-website` base path.
- Removed legacy server API routes from the cutover branch only. The existing live application remains unchanged.
- Added a CI build check. The current static export successfully builds `out/index.html` and `out/login/index.html`.
- Added the missing `comments(post)` index reported by the Supabase performance advisor.
- Kept the beta non-indexable with `public/robots.txt` until launch.

## Final steps before traffic can switch

1. Configure Supabase Auth Site URL / allowed redirect URL for the final GitHub Pages URL (`https://chillymz.github.io/IMDb-website/`), or the final custom domain if one is chosen before launch.
2. Create the owner's first Supabase Auth account. After verified ownership, link that auth UUID to the existing legacy reader profile and add it to `chillymz.administrators`.
3. Run authenticated end-to-end checks: sign up/sign in, rating writes, profile edits, submissions, chapter reviews, discussions/votes/replies, reports/blocking, admin approval/import/editing, analytics, sign out, expired/invalid tokens, and cover upload/download.
4. Reconcile any writes made in the old live database after the initial snapshot. Take a rollback copy before changing traffic.
5. Deploy the verified static export to GitHub Pages and test the actual published URL on desktop and mobile.
6. Only after those checks pass, switch traffic and remove the old deployment.

## Security notes

The Supabase advisor reports informational `rls_enabled_no_policy` findings because the application tables are deliberately closed to direct browser access. Do not add broad client policies just to silence those notices. The service API performs authentication, authorization, moderation, ownership checks, chapter bounds, and rate limiting server-side.

Reference: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
