# WEMACOOP Premium v12 — Member Management Backend

This build continues the v11 portal/backend foundation and implements the first operational Admin workflow: **Member Management**.

The public v10/v11 website remains intact. The backend is still deployed separately from Cloudflare static assets.

## New in v12

### Admin Member Management
- Dedicated responsive page: `portal/admin/members.html`
- Search by member number, name, email, staff ID or department
- Filter by cooperative status and portal activation state
- Server-side pagination
- Create member
- Edit member details
- Change status: Active / Suspended / Exited
- Send/re-send first-time portal activation
- Unlock a locked portal account
- Generate password-reset instructions
- CSV bulk member import with all-or-nothing validation
- Downloadable CSV import template
- Member-specific and global administration audit trail
- No hard-delete endpoint: member and financial history is retained

### Authentication improvements
- Added mandatory password-change flow for accounts created with `MustChangePassword=true`
- Initial admin can no longer continue indefinitely with the seeded/temporary password
- Added `portal/change-password.html`
- Added authenticated `POST /api/auth/password/change`
- Password-reset completion clears the forced-password-change flag
- New activation request invalidates older unused activation tokens
- Security stamp validation runs on every authenticated request so suspending/exiting a member invalidates old login cookies immediately

### Security/quality improvements
- Member/admin HTML rendering now escapes API-provided text before inserting it into HTML
- JSON enum strings are supported consistently by the API
- ASP.NET Core Problem Details / exception handling enabled
- Member changes and linked Identity changes use database transactions where needed
- CSV imports reject member numbers/emails already present in either the member register or Identity store
- FormData uploads now work correctly with the CSRF-aware `PortalApi` client

## Important files

```text
portal/admin/members.html
portal/admin/members.js
portal/change-password.html
assets/templates/member-import-template.csv

backend/WemaCoop.Api/Controllers/AdminMembersController.cs
backend/WemaCoop.Api/Contracts/AdminMemberContracts.cs
backend/WemaCoop.Api/Models/Member.cs
backend/WemaCoop.Api/Data/AppDbContext.cs
backend/MEMBER_MANAGEMENT.md
```

## Preview without backend

Admin dashboard:

```text
/portal/admin/index.html?demo=1
```

Member management:

```text
/portal/admin/members.html?demo=1
```

Member dashboard:

```text
/portal/member/index.html?demo=1
```

Demo mode is deliberately read-only.

## Backend deployment

The `backend/` directory is excluded from Cloudflare static asset deployment by `.assetsignore`.

Recommended topology:

```text
www.wemacoop.com      -> Cloudflare static website
portal.wemacoop.com   -> static portal UI
api.wemacoop.com      -> ASP.NET Core API
                           |
                           +-> PostgreSQL
```

For the cleanest cookie setup, proxy `/api/*` through the same first-party domain or configure `portal.wemacoop.com` and `api.wemacoop.com` deliberately as same-site production services.

See `backend/README.md` and `backend/MEMBER_MANAGEMENT.md` for the local migration/test process.

## Still required before production

- Production email delivery provider
- Admin MFA
- Secrets manager / environment secrets
- TLS and production reverse proxy configuration
- Database backups and restore testing
- Approved WEMACOOP member data import
- Data retention/privacy policy
- Full financial ledger/import integration
- Loan application approval workflow
- CMS modules for Executives, Products, Projects, Resources and News
