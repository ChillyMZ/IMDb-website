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

This repository does not automatically deploy or sync to the existing live website. The .openai/hosting.json file identifies the existing Sites project.

## Beta status

Privacy and terms require review before public launch. Live mobile and speed verification remain outstanding. Indexing is disabled in this private-beta source. Cover provenance is in public/covers/SOURCES.md.
