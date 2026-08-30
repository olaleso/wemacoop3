# WEMACOOP Premium v10

This build extends v9 with a dedicated, responsive Resources & Downloads centre while preserving the existing homepage, Products, Projects and Executive Committee pages.

## New in v10

- `resources.html` — searchable/filterable member resource centre.
- `resources-data.js` — single front-end data source for forms, governance documents and online guides.
- `resources.js` — directory rendering, search and category filtering.
- Homepage resource preview now links into the resource centre instead of simulating document downloads.
- Navigation/footer links across the site now point to the dedicated resource page.
- Desktop homepage navigation simplified to About, Executives, Products, Projects, Resources and Contact.
- Document-control pattern added for future admin-managed files (version, approval date, owner, publication status).
- Official files are never presented as downloadable until an approved file is actually supplied.

## Resource behaviour

Resources use one of two statuses:

- `online` — links to a live page/guide already available in the website.
- `pending` — no downloadable file is claimed; the CTA directs the member to the Secretariat until an approved file is provided.

When WEMACOOP supplies official PDFs/forms, update the relevant object in `resources-data.js`, add the file under an assets/documents folder, and change the resource status/action/href.

## Deployment

Keep these files at the same repository root as `wrangler.jsonc`. The existing Cloudflare Workers static-assets configuration remains valid.

## Recommended next phase

The public website now has the main content architecture required for an admin backend. The next major phase should be the Admin Portal / CMS layer for:

- Executives
- Products and loan schemes
- Projects
- Resources/documents
- News/announcements
- Contact enquiries

Do not publish official loan rates, approved forms, governance documents or executive details until supplied/approved by WEMACOOP.
