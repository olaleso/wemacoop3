# Member Management — Phase 2

## Why the member register comes before portal registration

The portal does not permit open registration. A staff member must first exist in the official cooperative register. This prevents an arbitrary visitor from creating an account and claiming cooperative membership.

## Admin workflow

### Create one member

Admin Portal -> Members -> Add member

Required:
- Membership number
- Full name
- Registered email

Optional:
- Staff ID
- Phone number
- Department
- Date joined

New records default to `Active`, but do not automatically have portal access.

### Bulk import

Use the CSV template at:

```text
assets/templates/member-import-template.csv
```

Columns:

```text
MembershipNumber,FullName,WorkEmail,StaffId,PhoneNumber,Department,DateJoined
```

`DateJoined` should preferably use `YYYY-MM-DD`.

The import is **all-or-nothing**. If any row is invalid or conflicts with an existing member/Identity account, the API returns validation errors and inserts no rows.

This reduces the risk of a half-imported cooperative register.

### Portal activation

A member can activate from the public Member Portal, or an administrator can generate a fresh activation invitation from the member drawer.

Only:
- Active members
- without an existing linked Identity account

can activate.

Generating a new activation token invalidates older unused activation tokens.

### Suspend / exit

Admin can set:
- `Active`
- `Suspended`
- `Exited`

Suspending or exiting a member disables the linked Identity account and updates its security stamp. The API validates security stamps on every authenticated request, so existing sessions stop being valid without waiting for the normal Identity validation interval.

Reactivating restores sign-in eligibility, but the member must sign in again.

### Unlock account

Clears:
- lockout end date
- failed access count

It does not change the member's password.

### Password reset

The admin action generates the standard ASP.NET Core Identity password-reset token and sends it through `IEmailDeliveryService`.

The Development service only writes the token to application logs/returns it in Development. Production must use an approved mail provider.

### Hard deletion

There is intentionally no member-delete endpoint in this phase.

For a cooperative/financial system, removing a person record can destroy the relationship to historical savings, loans, transactions and audit activity. Use `Exited` or `Suspended` instead.

## API endpoints

```text
GET    /api/admin/members
GET    /api/admin/members/{id}
POST   /api/admin/members
PUT    /api/admin/members/{id}
POST   /api/admin/members/{id}/status
POST   /api/admin/members/{id}/activation
POST   /api/admin/members/{id}/unlock
POST   /api/admin/members/{id}/password-reset
POST   /api/admin/members/import
GET    /api/admin/members/audit
```

All routes require the `Admin` role and CSRF protection for unsafe HTTP methods.

## Database additions

`Member` now includes:

```text
LastUpdatedAt
```

New `MemberAuditLog` stores:

```text
Id
MemberId
Action
Summary
ActorUserId
ActorName
CreatedAt
```

## Migration

If you have **not created any v11 migration/database yet**, create one migration from v12:

```bash
dotnet ef migrations add InitialPortalAndMemberManagement
dotnet ef database update
```

If you **already created/applied the v11 InitialPortal migration**, create a second migration:

```bash
dotnet ef migrations add MemberManagementPhase
dotnet ef database update
```

Review the generated migration before applying it to a non-development database.
