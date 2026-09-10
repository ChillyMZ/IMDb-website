# Supabase migration status

The existing Sites deployment remains the live application. Do not enable GitHub Pages against the current server-rendered build: it still needs the Sites server routes and sign-in.

## Completed

- Created a Supabase project in the ChillyMZ organization at the quoted $0/month project cost.
- Applied `chillymz_private_staging` using `schema.sql`.
- Copied the live database snapshot into the private `chillymz` schema: 30 books, 7 ratings, 1 profile, 1 discussion, 1 reply, 2 moderation cases, and 1 moderation event.
- Preserved legacy record IDs. No accounts have been reassigned.
- All 15 tables have RLS enabled. `anon` and `authenticated` have no direct schema or table access. This is intentionally a protected staging database, not a functioning browser API.
- No user records or credentials are stored in this repository.

## Remaining before cutover

1. Port the server endpoints to Supabase Edge Functions, retaining per-request verified identity, moderation, rate limits, chapter bounds, and transactional admin operations.
2. Create the static GitHub Pages build and replace Sites sign-in with Supabase Auth. Preserve book/chapter links under the repository base path.
3. Provision cover storage and transfer uploaded objects. Database cover references alone are not the image files.
4. Link old reader identities only after verified account ownership. Never match a display name or allow a browser to choose an existing reader ID. Assign administrator access through the protected administrators table.
5. Verify guest browsing, authenticated writes, ownership checks, approval, reports, blocking, and invalid tokens against the deployed API.
6. Reconcile all database changes since this initial snapshot immediately before switching traffic. Preserve a rollback copy; never silently overwrite newer data with this snapshot.
7. Configure the Pages deployment and Auth redirect URLs, then verify the actual published site before announcing a migration.

Supabase's advisor reports informational `rls_enabled_no_policy` findings for this deliberately closed staging schema. No client policies should be added merely to silence those findings. The API access model must be implemented and tested first.

Reference: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
