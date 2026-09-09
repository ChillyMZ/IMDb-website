# ChillyMZ

A chapter-by-chapter book rating and discussion website. Source of the working Sites beta.

## Development

Node.js 22.13+ and npm are required.

```sh
npm ci
npm run dev
npm run build
node --test tests/*.test.cjs
```

## Hosting

This server-backed Vinext/React application targets Cloudflare Workers and uses D1 (DB), R2 (BUCKET), migrations in drizzle/, and trusted ChatGPT authentication supplied by Sites. GitHub Pages alone cannot run the backend.

Moving hosting requires configuring storage and securely adapting authentication. Never trust identity headers sent directly by clients. Live accounts, ratings, uploaded files, and credentials are not included.

This repository does not automatically deploy or sync to the existing live website. The live hosting manifest is omitted from this public export.

## Beta status

Privacy and terms require review before public launch. Live mobile and speed verification remain outstanding. Indexing is disabled in this private-beta source. Cover provenance is in public/covers/SOURCES.md.

## Required configuration before deployment

Personal owner/contact details and the site URL have been replaced with example.invalid placeholders. Set the owner email in app/core-service.ts, the domain in app/site-config.ts, and the operator/contact details in the policy pages. Configure the hosting manifest with your own project. Until configured, real accounts will not receive owner privileges. Tests use the matching placeholder identity. Do not treat the policy placeholders as a finished public policy.
