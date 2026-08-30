# WEMACOOP API — Portal + Member Management

## Stack
- ASP.NET Core 10 Web API
- ASP.NET Core Identity with cookie authentication
- Entity Framework Core 10
- PostgreSQL via Npgsql

## Local start

### 1. Prerequisites
- .NET 10 SDK
- Docker Desktop (or a local PostgreSQL instance)

### 2. Start PostgreSQL

From `backend/`:

```bash
docker compose up -d
```

The included development database is:

```text
Database: wemacoop_dev
User:     wemacoop
Password: wemacoop_dev
Port:     5432
```

These are development-only values.

### 3. Install EF CLI

```bash
dotnet tool install --global dotnet-ef
```

### 4. Create/apply the database migration

If this is your first backend migration:

```bash
cd WemaCoop.Api
dotnet ef migrations add InitialPortalAndMemberManagement
dotnet ef database update
```

If v11 `InitialPortal` has already been applied:

```bash
dotnet ef migrations add MemberManagementPhase
dotnet ef database update
```

### 5. Seed an initial administrator securely

PowerShell example:

```powershell
$env:SeedAdmin__Email="admin@example.com"
$env:SeedAdmin__Password="Use-A-Strong-Temporary-Password!"
$env:RunSeeder="true"
dotnet run --launch-profile https
```

Bash example:

```bash
SeedAdmin__Email="admin@example.com" \
SeedAdmin__Password="Use-A-Strong-Temporary-Password!" \
RunSeeder=true \
dotnet run --launch-profile https
```

The seeded admin has `MustChangePassword=true` and is sent to the portal password-change screen immediately after first sign-in.

### 6. Run the static portal locally

Serve the repository root with any static local server on port 5500, for example VS Code Live Server.

`portal/config.js` points local browsers to:

```text
https://localhost:7080/api
```

The included launch profile exposes exactly that HTTPS endpoint.

## First end-to-end test

1. Start PostgreSQL.
2. Apply migration.
3. Start API with initial admin environment variables.
4. Open `/portal/admin/login.html`.
5. Sign in as the seeded admin.
6. Change the temporary password when prompted.
7. Open **Members**.
8. Add one test member.
9. Send an activation invitation from the member drawer, or use `/portal/activate.html`.
10. In Development, read the activation token from the API log/Development response.
11. Complete activation and create a member password.
12. Sign in through `/portal/login.html`.
13. Confirm the Member dashboard loads.
14. Suspend the member in Admin and confirm the existing member session loses access.
15. Reactivate the member and sign in again.

## Authentication model
- No public member registration.
- No admin self-registration.
- Member activation requires existing membership number + registered email.
- Activation tokens are single-use and expire after 30 minutes.
- Five failed logins lock an account for 15 minutes.
- Auth cookie is HttpOnly and Secure.
- Unsafe API requests require an antiforgery token.
- Admin/member authorization is role-based.
- Suspended/exited member sessions are invalidated using Identity security stamps.

## Production items still required
- Replace `DevelopmentEmailDeliveryService` with approved email delivery.
- Configure real activation/reset URLs in email templates.
- Enforce Admin MFA.
- Put secrets in the hosting platform/secret manager.
- Configure DB backups/PITR as appropriate.
- Add application monitoring and alerting.
- Add privacy/data retention controls.
- Deploy API independently from Cloudflare static assets.
