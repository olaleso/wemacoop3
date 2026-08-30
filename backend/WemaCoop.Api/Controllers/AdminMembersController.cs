using System.Globalization;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WemaCoop.Api.Contracts;
using WemaCoop.Api.Data;
using WemaCoop.Api.Models;
using WemaCoop.Api.Services;

namespace WemaCoop.Api.Controllers;

[ApiController]
[Route("api/admin/members")]
[Authorize(Roles = "Admin")]
public sealed class AdminMembersController(
    AppDbContext db,
    UserManager<ApplicationUser> users,
    IEmailDeliveryService email,
    IHostEnvironment env) : ControllerBase
{
    private const int MaxPageSize = 100;

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? search,
        [FromQuery] MemberStatus? status,
        [FromQuery] string? access,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 10, MaxPageSize);

        IQueryable<Member> query = db.Members.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            query = query.Where(x =>
                x.MembershipNumber.ToLower().Contains(term) ||
                x.FullName.ToLower().Contains(term) ||
                x.WorkEmail.ToLower().Contains(term) ||
                (x.StaffId != null && x.StaffId.ToLower().Contains(term)) ||
                (x.Department != null && x.Department.ToLower().Contains(term)));
        }

        if (status is not null)
            query = query.Where(x => x.Status == status);

        if (!string.IsNullOrWhiteSpace(access))
        {
            switch (access.Trim().ToLowerInvariant())
            {
                case "activated":
                    query = query.Where(x => x.UserId != null);
                    break;
                case "not-activated":
                    query = query.Where(x => x.UserId == null);
                    break;
            }
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(x => x.FullName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                x.Id,
                x.MembershipNumber,
                x.StaffId,
                x.FullName,
                x.WorkEmail,
                x.PhoneNumber,
                x.Department,
                x.DateJoined,
                status = x.Status.ToString(),
                portalAccess = x.UserId == null ? "Not activated" : "Activated",
                x.CreatedAt,
                x.LastUpdatedAt
            })
            .ToListAsync(ct);

        return Ok(new
        {
            items,
            page,
            pageSize,
            total,
            totalPages = (int)Math.Ceiling(total / (double)pageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var member = await db.Members.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (member is null) return NotFound(new { message = "Member was not found." });

        ApplicationUser? user = null;
        if (member.UserId is Guid userId)
            user = await users.FindByIdAsync(userId.ToString());

        var audit = await db.MemberAuditLogs.AsNoTracking()
            .Where(x => x.MemberId == id)
            .OrderByDescending(x => x.CreatedAt)
            .Take(12)
            .Select(x => new { x.Action, x.Summary, x.ActorName, x.CreatedAt })
            .ToListAsync(ct);

        return Ok(new
        {
            member = new
            {
                member.Id,
                member.MembershipNumber,
                member.StaffId,
                member.FullName,
                member.WorkEmail,
                member.PhoneNumber,
                member.Department,
                member.DateJoined,
                status = member.Status.ToString(),
                member.CreatedAt,
                member.LastUpdatedAt
            },
            access = new
            {
                activated = user is not null,
                isActive = user?.IsActive ?? false,
                isLocked = user?.LockoutEnd > DateTimeOffset.UtcNow,
                lastLoginAt = user?.LastLoginAt,
                user?.MustChangePassword
            },
            audit
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateMemberRequest req, CancellationToken ct)
    {
        var errors = ValidateMember(req.MembershipNumber, req.FullName, req.WorkEmail);
        if (errors.Count > 0) return BadRequest(new { message = "Please correct the member details.", errors });

        var membershipNumber = NormalizeMembership(req.MembershipNumber);
        var emailAddress = NormalizeEmail(req.WorkEmail);

        if (await db.Members.AnyAsync(x => x.MembershipNumber == membershipNumber, ct))
            return Conflict(new { message = "Membership number already exists." });

        if (await db.Members.AnyAsync(x => x.WorkEmail == emailAddress, ct))
            return Conflict(new { message = "Email address is already assigned to another member." });

        if (await users.FindByEmailAsync(emailAddress) is not null)
            return Conflict(new { message = "Email address is already used by an existing portal account." });

        if (await users.FindByNameAsync(membershipNumber) is not null)
            return Conflict(new { message = "Membership number is already used by an existing portal account." });

        var member = new Member
        {
            MembershipNumber = membershipNumber,
            StaffId = Clean(req.StaffId),
            FullName = req.FullName.Trim(),
            WorkEmail = emailAddress,
            PhoneNumber = Clean(req.PhoneNumber),
            Department = Clean(req.Department),
            DateJoined = req.DateJoined,
            Status = MemberStatus.Active
        };

        db.Members.Add(member);
        AddAudit(member.Id, "MemberCreated", $"Member {member.MembershipNumber} was created.");
        await db.SaveChangesAsync(ct);

        return Created($"/api/admin/members/{member.Id}", new
        {
            member.Id,
            member.MembershipNumber,
            member.FullName,
            member.WorkEmail
        });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateMemberRequest req, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        var member = await db.Members.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (member is null) return NotFound(new { message = "Member was not found." });

        var errors = ValidateMember(req.MembershipNumber, req.FullName, req.WorkEmail);
        if (errors.Count > 0) return BadRequest(new { message = "Please correct the member details.", errors });

        var membershipNumber = NormalizeMembership(req.MembershipNumber);
        var emailAddress = NormalizeEmail(req.WorkEmail);

        if (await db.Members.AnyAsync(x => x.Id != id && x.MembershipNumber == membershipNumber, ct))
            return Conflict(new { message = "Membership number already exists." });

        if (await db.Members.AnyAsync(x => x.Id != id && x.WorkEmail == emailAddress, ct))
            return Conflict(new { message = "Email address is already assigned to another member." });

        var linkedUser = member.UserId is Guid linkedUserId
            ? await users.FindByIdAsync(linkedUserId.ToString())
            : null;

        var identityByEmail = await users.FindByEmailAsync(emailAddress);
        if (identityByEmail is not null && identityByEmail.Id != linkedUser?.Id)
            return Conflict(new { message = "Email address is already used by another portal account." });

        var identityByName = await users.FindByNameAsync(membershipNumber);
        if (identityByName is not null && identityByName.Id != linkedUser?.Id)
            return Conflict(new { message = "Membership number is already used by another portal account." });

        var previousNumber = member.MembershipNumber;
        var previousEmail = member.WorkEmail;

        member.MembershipNumber = membershipNumber;
        member.StaffId = Clean(req.StaffId);
        member.FullName = req.FullName.Trim();
        member.WorkEmail = emailAddress;
        member.PhoneNumber = Clean(req.PhoneNumber);
        member.Department = Clean(req.Department);
        member.DateJoined = req.DateJoined;
        member.LastUpdatedAt = DateTimeOffset.UtcNow;

        if (linkedUser is not null)
        {
            var user = linkedUser;
            if (user is not null)
            {
                if (!string.Equals(previousNumber, membershipNumber, StringComparison.Ordinal))
                {
                    var userNameResult = await users.SetUserNameAsync(user, membershipNumber);
                    if (!userNameResult.Succeeded)
                        return BadRequest(new { message = "Could not update the linked portal username.", errors = userNameResult.Errors.Select(x => x.Description) });
                }

                if (!string.Equals(previousEmail, emailAddress, StringComparison.OrdinalIgnoreCase))
                {
                    var emailResult = await users.SetEmailAsync(user, emailAddress);
                    if (!emailResult.Succeeded)
                        return BadRequest(new { message = "Could not update the linked portal email address.", errors = emailResult.Errors.Select(x => x.Description) });
                    user.EmailConfirmed = true;
                }

                user.FullName = member.FullName;
                user.PhoneNumber = member.PhoneNumber;
                await users.UpdateAsync(user);
            }
        }

        AddAudit(member.Id, "MemberUpdated", $"Member profile for {member.MembershipNumber} was updated.");
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return Ok(new { message = "Member details updated." });
    }

    [HttpPost("{id:guid}/status")]
    public async Task<IActionResult> ChangeStatus(Guid id, ChangeMemberStatusRequest req, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        var member = await db.Members.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (member is null) return NotFound(new { message = "Member was not found." });

        if (!Enum.IsDefined(req.Status))
            return BadRequest(new { message = "Invalid member status." });

        var oldStatus = member.Status;
        member.Status = req.Status;
        member.LastUpdatedAt = DateTimeOffset.UtcNow;

        if (member.UserId is Guid userId)
        {
            var user = await users.FindByIdAsync(userId.ToString());
            if (user is not null)
            {
                user.IsActive = req.Status == MemberStatus.Active;
                await users.UpdateAsync(user);

                if (!user.IsActive)
                    await users.UpdateSecurityStampAsync(user);
            }
        }

        var reason = string.IsNullOrWhiteSpace(req.Reason) ? string.Empty : $" Reason: {req.Reason.Trim()}";
        AddAudit(member.Id, "StatusChanged", $"Status changed from {oldStatus} to {member.Status}.{reason}");
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Ok(new { message = $"Member status changed to {member.Status}." });
    }

    [HttpPost("{id:guid}/activation")]
    public async Task<IActionResult> SendActivation(Guid id, CancellationToken ct)
    {
        var member = await db.Members.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (member is null) return NotFound(new { message = "Member was not found." });
        if (member.Status != MemberStatus.Active)
            return BadRequest(new { message = "Only active members can activate portal access." });
        if (member.UserId is not null)
            return BadRequest(new { message = "This member already has an activated portal account." });

        var existing = await db.AccountActivations
            .Where(x => x.MemberId == member.Id && x.UsedAt == null)
            .ToListAsync(ct);
        if (existing.Count > 0) db.AccountActivations.RemoveRange(existing);

        var raw = SecurityHelpers.CreateOpaqueToken();
        db.AccountActivations.Add(new AccountActivation
        {
            MemberId = member.Id,
            TokenHash = SecurityHelpers.HashToken(raw),
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(30)
        });

        AddAudit(member.Id, "ActivationSent", "A new portal activation invitation was generated.");
        await db.SaveChangesAsync(ct);
        await email.SendActivationAsync(member.WorkEmail, member.FullName, raw, ct);

        return Ok(new
        {
            message = "Activation instructions have been generated for the member.",
            developmentToken = env.IsDevelopment() ? raw : null
        });
    }

    [HttpPost("{id:guid}/unlock")]
    public async Task<IActionResult> Unlock(Guid id, CancellationToken ct)
    {
        var member = await db.Members.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (member is null) return NotFound(new { message = "Member was not found." });
        if (member.UserId is not Guid userId)
            return BadRequest(new { message = "This member has not activated portal access." });

        var user = await users.FindByIdAsync(userId.ToString());
        if (user is null) return NotFound(new { message = "Linked portal account was not found." });

        await users.SetLockoutEndDateAsync(user, null);
        await users.ResetAccessFailedCountAsync(user);
        AddAudit(member.Id, "PortalUnlocked", "Portal account lockout and failed access count were cleared.");
        await db.SaveChangesAsync(ct);

        return Ok(new { message = "Portal account unlocked." });
    }

    [HttpPost("{id:guid}/password-reset")]
    public async Task<IActionResult> SendPasswordReset(Guid id, CancellationToken ct)
    {
        var member = await db.Members.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (member is null) return NotFound(new { message = "Member was not found." });
        if (member.UserId is not Guid userId)
            return BadRequest(new { message = "This member has not activated portal access." });

        var user = await users.FindByIdAsync(userId.ToString());
        if (user is null || string.IsNullOrWhiteSpace(user.Email))
            return BadRequest(new { message = "Linked portal account does not have a valid email address." });

        var token = await users.GeneratePasswordResetTokenAsync(user);
        await email.SendPasswordResetAsync(user.Email, user.FullName, token, ct);
        AddAudit(member.Id, "PasswordResetSent", "A password reset instruction was generated for the member.");
        await db.SaveChangesAsync(ct);

        return Ok(new
        {
            message = "Password reset instructions have been generated for the member.",
            developmentToken = env.IsDevelopment() ? token : null
        });
    }

    [HttpPost("import")]
    [RequestSizeLimit(2_000_000)]
    public async Task<IActionResult> Import([FromForm] IFormFile? file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "Choose a CSV file to import." });

        if (!string.Equals(Path.GetExtension(file.FileName), ".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "This version accepts CSV files. Save the Excel member register as CSV before importing." });

        using var reader = new StreamReader(file.OpenReadStream(), Encoding.UTF8, true);
        var headerLine = await reader.ReadLineAsync(ct);
        if (string.IsNullOrWhiteSpace(headerLine))
            return BadRequest(new { message = "The CSV file is empty." });

        var headers = ParseCsvLine(headerLine)
            .Select((value, index) => new { value = value.Trim(), index })
            .ToDictionary(x => x.value, x => x.index, StringComparer.OrdinalIgnoreCase);

        var required = new[] { "MembershipNumber", "FullName", "WorkEmail" };
        var missing = required.Where(x => !headers.ContainsKey(x)).ToArray();
        if (missing.Length > 0)
            return BadRequest(new { message = $"Missing required CSV column(s): {string.Join(", ", missing)}." });

        string? Get(IReadOnlyList<string> row, string name)
            => headers.TryGetValue(name, out var index) && index < row.Count ? Clean(row[index]) : null;

        var existingNumbers = (await db.Members.AsNoTracking().Select(x => x.MembershipNumber).ToListAsync(ct))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var existingEmails = (await db.Members.AsNoTracking().Select(x => x.WorkEmail).ToListAsync(ct))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var identityNames = (await db.Users.AsNoTracking().Where(x => x.UserName != null).Select(x => x.UserName!).ToListAsync(ct))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var identityEmails = (await db.Users.AsNoTracking().Where(x => x.Email != null).Select(x => x.Email!).ToListAsync(ct))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var stagedNumbers = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var stagedEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        var members = new List<Member>();
        var errors = new List<string>();
        var lineNumber = 1;

        while (!reader.EndOfStream)
        {
            var line = await reader.ReadLineAsync(ct);
            lineNumber++;
            if (string.IsNullOrWhiteSpace(line)) continue;

            var row = ParseCsvLine(line);
            var rawNumber = Get(row, "MembershipNumber") ?? string.Empty;
            var fullName = Get(row, "FullName") ?? string.Empty;
            var rawEmail = Get(row, "WorkEmail") ?? string.Empty;
            var validation = ValidateMember(rawNumber, fullName, rawEmail);
            if (validation.Count > 0)
            {
                errors.Add($"Row {lineNumber}: {string.Join(" ", validation)}");
                continue;
            }

            var membershipNumber = NormalizeMembership(rawNumber);
            var emailAddress = NormalizeEmail(rawEmail);

            if (existingNumbers.Contains(membershipNumber) || identityNames.Contains(membershipNumber) || !stagedNumbers.Add(membershipNumber))
            {
                errors.Add($"Row {lineNumber}: membership number {membershipNumber} already exists or is duplicated in the file.");
                continue;
            }

            if (existingEmails.Contains(emailAddress) || identityEmails.Contains(emailAddress) || !stagedEmails.Add(emailAddress))
            {
                errors.Add($"Row {lineNumber}: email address {emailAddress} already exists or is duplicated in the file.");
                continue;
            }

            DateOnly? dateJoined = null;
            var rawDate = Get(row, "DateJoined");
            if (!string.IsNullOrWhiteSpace(rawDate))
            {
                if (DateOnly.TryParseExact(rawDate, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed) ||
                    DateOnly.TryParse(rawDate, CultureInfo.InvariantCulture, DateTimeStyles.None, out parsed))
                {
                    dateJoined = parsed;
                }
                else
                {
                    errors.Add($"Row {lineNumber}: DateJoined must be a valid date, preferably YYYY-MM-DD.");
                    continue;
                }
            }

            members.Add(new Member
            {
                MembershipNumber = membershipNumber,
                FullName = fullName.Trim(),
                WorkEmail = emailAddress,
                StaffId = Get(row, "StaffId"),
                PhoneNumber = Get(row, "PhoneNumber"),
                Department = Get(row, "Department"),
                DateJoined = dateJoined,
                Status = MemberStatus.Active
            });
        }

        if (errors.Count > 0)
            return BadRequest(new
            {
                message = "Import validation failed. No members were imported. Correct the highlighted rows and try again.",
                errors = errors.Take(50),
                errorCount = errors.Count
            });

        if (members.Count == 0)
            return BadRequest(new { message = "No member rows were found in the CSV file." });

        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        db.Members.AddRange(members);
        foreach (var member in members)
            AddAudit(member.Id, "MemberImported", $"Member {member.MembershipNumber} was created through CSV import.");
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Ok(new { message = $"{members.Count} member record(s) imported successfully.", imported = members.Count });
    }

    [HttpGet("audit")]
    public async Task<IActionResult> Audit([FromQuery] int take = 50, CancellationToken ct = default)
    {
        take = Math.Clamp(take, 10, 200);
        var items = await db.MemberAuditLogs.AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Take(take)
            .Select(x => new { x.MemberId, x.Action, x.Summary, x.ActorName, x.CreatedAt })
            .ToListAsync(ct);
        return Ok(items);
    }

    private void AddAudit(Guid? memberId, string action, string summary)
    {
        Guid? actorUserId = null;
        var rawId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(rawId, out var parsed)) actorUserId = parsed;

        db.MemberAuditLogs.Add(new MemberAuditLog
        {
            MemberId = memberId,
            Action = action,
            Summary = summary,
            ActorUserId = actorUserId,
            ActorName = User.Identity?.Name ?? "Administrator"
        });
    }

    private static List<string> ValidateMember(string membershipNumber, string fullName, string workEmail)
    {
        var errors = new List<string>();
        if (string.IsNullOrWhiteSpace(membershipNumber)) errors.Add("Membership number is required.");
        if (string.IsNullOrWhiteSpace(fullName)) errors.Add("Full name is required.");
        if (string.IsNullOrWhiteSpace(workEmail) || !workEmail.Contains('@')) errors.Add("A valid email address is required.");
        return errors;
    }

    private static string NormalizeMembership(string value) => value.Trim().ToUpperInvariant();
    private static string NormalizeEmail(string value) => value.Trim().ToLowerInvariant();
    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static List<string> ParseCsvLine(string line)
    {
        var result = new List<string>();
        var current = new StringBuilder();
        var quoted = false;

        for (var i = 0; i < line.Length; i++)
        {
            var c = line[i];
            if (c == '"')
            {
                if (quoted && i + 1 < line.Length && line[i + 1] == '"')
                {
                    current.Append('"');
                    i++;
                }
                else
                {
                    quoted = !quoted;
                }
            }
            else if (c == ',' && !quoted)
            {
                result.Add(current.ToString());
                current.Clear();
            }
            else
            {
                current.Append(c);
            }
        }

        result.Add(current.ToString());
        return result;
    }
}
