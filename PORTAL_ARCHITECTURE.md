# WEMACOOP Portal Architecture — Phase 2

## Public layer
The existing public WEMACOOP site remains a static Cloudflare deployment.

## Portal layer
Static responsive portal pages provide:
- Member login
- First-time activation
- Forgot/reset password
- Forced first-login password change
- Member dashboard
- Admin login
- Admin dashboard
- Member Management

## API layer
ASP.NET Core provides authentication, authorization and cooperative data APIs. The browser does not store bearer tokens; Identity uses secure cookies.

## Database layer
PostgreSQL stores Identity, member records and operational data.

## Member lifecycle

```text
Official member record
       |
       +-> Active but not activated
                |
                +-> activation invitation / self-activation request
                         |
                         +-> 30-minute single-use token
                                  |
                                  +-> Identity Member account
                                           |
                                           +-> Member Portal
```

Suspended/Exited members remain in the database but lose portal access.

## Admin member-management lifecycle

```text
Admin login
  -> forced password change if temporary password
  -> Member Management
       -> create/edit/import
       -> activate/unlock/reset access
       -> suspend/reactivate/exit
       -> audit trail
```

There is intentionally no hard-delete member operation.

## Roles

### Member
- Own dashboard/data only
- Savings/shares/loan summary
- Transactions
- Resources
- Future applications/profile workflows

### Admin
- Member register
- Member activation/access controls
- Audit trail
- Future content/loan application/financial administration modules

## Next backend milestones
1. Member profile + financial-account detail pages
2. Savings/share ledger and statement endpoints
3. Loan application and approval workflow
4. Admin MFA
5. Content CMS (Executives, Products, Projects, Resources, News)
6. Notifications/email integration
7. Reporting and export controls
