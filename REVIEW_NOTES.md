# WEMACOOP Premium v12 — implementation notes

## Completed in this phase

- Member Management API and responsive Admin UI.
- Member search, filter and pagination.
- Single-member create/edit workflow.
- CSV bulk import with all-or-nothing validation.
- Active/Suspended/Exited lifecycle instead of destructive deletion.
- First-time activation re-send, portal unlock and password reset admin actions.
- Member administration audit trail.
- Linked Identity account synchronization when member number/email/name/phone changes.
- Immediate invalidation of suspended/exited member sessions through Identity security-stamp validation.
- Forced password-change screen for seeded/temporary admin passwords.
- CSRF-compatible `FormData` upload support.
- Escaped API-rendered HTML in the member/admin dashboards.
- Development launch profile aligned with `portal/config.js` (`https://localhost:7080`).

## Intentionally not implemented yet

- Admin MFA.
- Production email provider.
- Member hard delete.
- Savings/share ledger administration.
- Loan application approval workflow.
- Full transaction statement export.
- Excel `.xlsx` direct import. v12 accepts CSV exported from Excel.
- Content CMS for executives/products/projects/resources/news.

## Important deployment note

Cloudflare is serving the static site and portal UI only. The ASP.NET Core API under `backend/` is excluded by `.assetsignore` and must be hosted separately, or proxied into `/api/*`.

Do not expect live Member/Admin authentication merely from committing v12 to the current Cloudflare static repository. Demo pages will work immediately; real authentication requires PostgreSQL + the ASP.NET Core API.
