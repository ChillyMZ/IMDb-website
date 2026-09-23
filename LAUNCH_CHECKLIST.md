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
- [ ] Create the owner Supabase Auth account.
- [ ] Link that verified Auth account to the existing owner reader ID.
- [ ] Add the owner Auth UUID to the protected administrators table.
- [ ] Set Supabase Site URL and allowed redirect URL for GitHub Pages.
- [ ] Confirm GitHub repository Pages source is GitHub Actions.

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
