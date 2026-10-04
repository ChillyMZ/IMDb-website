# ChillyMZ launch checklist

This list is for the Supabase/GitHub Pages cutover. The product scope is frozen until the first real users have used it.

## Already prepared
- [x] Static Next.js export builds successfully.
- [x] Supabase-backed API functions are deployed.
- [x] Database snapshot and protected schema are in place.
- [x] Private cover bucket exists for future uploads.
- [x] GitHub Pages deployment workflow is prepared.
- [x] Supabase cutover is isolated in a draft pull request.
- [x] Homepage/catalogue explains the core idea immediately.
- [x] Catalogue has loading, empty, search, retry, and pagination states.
- [x] Branded 404 page is included.
- [x] Privacy, terms, cookie controls, safety, reporting, blocking, moderation and admin tools remain in the build.

## Requires the owner before cutover
- [x] Create the owner Supabase Auth account; email confirmation verified on October 3, 2026.
- [x] Link that verified Auth account to the existing owner reader ID; owner confirmed the legacy profile and the database link was verified.
- [x] Add the owner Auth UUID to the protected administrators table; membership verified by database query.
- [x] Owner reports saving Site URL and allowed redirects for GitHub Pages, including `/IMDb-website/login/`; dashboard configuration has not been independently re-read.
- [x] Owner confirms selecting GitHub Actions as the Pages source; not independently re-read.

## Current private deployment
The newer private Sites deployment is separate from this draft Supabase cutover. It uses its existing database and private owner-only hosting; successful checks there do not complete the Supabase end-to-end checks below. Do not merge this draft or enable public Pages deployment without explicit owner approval. Preserve the verified static export output `out/index.html` and `out/login/index.html`.

## Final test pass
- [ ] Guest can browse catalogue, open a book, view ratings and read community posts.
- [ ] Guest cannot rate, post, edit a profile, submit a book, or access admin actions.
- [ ] Signed-in reader can edit profile and sign out.
- [ ] Reader can rate a chapter, update the score, and use Save & continue.
- [ ] Diary reflects saved ratings.
- [ ] Book and chapter links survive refresh/back/forward navigation.
- [ ] Community post, reply and vote work.
- [ ] Chapter review create/update/delete works.
- [ ] Book request and full book submission work.
- [ ] Cover upload accepts PNG/JPEG/WebP and rejects invalid/oversized files.
- [ ] Block, mute, report and appeal flows work.
- [ ] Admin can edit/review/publish/reject books and open moderation tools.
- [ ] Invalid/expired tokens are rejected.
- [ ] Mobile test on Safari and Chrome; no horizontal page overflow.
- [ ] Desktop test on Safari and Chrome.
- [ ] Social share preview, favicon and page title render correctly.

## Cutover
- [ ] Reconcile any database changes made after the original snapshot.
- [ ] Keep a rollback copy of the pre-cutover state.
- [ ] Run the cutover branch build one last time.
- [ ] Merge the draft pull request to main.
- [ ] Confirm GitHub Pages deployment succeeds.
- [ ] Test the published URL as guest and signed-in owner.
- [ ] Only after verification, enable search indexing and announce the site.

## First 30 days
Do not add major features because they sound useful. Watch what readers actually do: book opens, account creation, first ratings, completed rating sessions, return visits, discussions, requests, and where people stop.
