using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WemaCoop.Api.Data;
using WemaCoop.Api.Models;

namespace WemaCoop.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public sealed class AdminController(AppDbContext db) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard(CancellationToken ct)
    {
        var total = await db.Members.CountAsync(ct);
        var active = await db.Members.CountAsync(x => x.Status == MemberStatus.Active, ct);
        var pending = await db.Members.CountAsync(x => x.Status == MemberStatus.Active && x.UserId == null, ct);
        var loans = await db.LoanAccounts
            .Where(x => x.Status == LoanStatus.Active)
            .SumAsync(x => (decimal?)x.Outstanding, ct) ?? 0;

        var members = await db.Members.AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Take(12)
            .Select(x => new
            {
                x.Id,
                x.MembershipNumber,
                x.FullName,
                email = x.WorkEmail,
                x.Department,
                status = x.UserId == null ? "Pending" : x.Status.ToString()
            })
            .ToListAsync(ct);

        return Ok(new
        {
            summary = new
            {
                totalMembers = total,
                activeMembers = active,
                pendingActivations = pending,
                outstandingLoans = loans
            },
            members
        });
    }
}
