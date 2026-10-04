# Search discovery

Public indexing is enabled. `/books/` and `/books/<title-author>/` provide exported HTML, individual metadata, canonical URLs, Book structured data and chapter links into the live reader. No ratings are fabricated in static pages. Login and the duplicate `/live/` route are noindex.

The Pages build refreshes the approved catalogue with `node scripts/sync-book-pages.mjs` before exporting the site. Newly approved books gain search pages on the next Pages deployment; run the deployment workflow after adding books. Existing interactive catalogue changes appear immediately.

Sitemap: https://chillymz.github.io/IMDb-website/sitemap.xml

Owner follow-up: add the URL-prefix property `https://chillymz.github.io/IMDb-website/` in Google Search Console, verify ownership with the provided HTML file or meta tag, and submit `sitemap.xml`. The verification token must come from the owner's Google account. Search-engine discovery and ranking are not guaranteed or immediate. GitHub project Pages serves robots.txt under the project path; this file does not control the github.io origin root. Page-level robots metadata and the submitted sitemap provide the project's indexing signals.
