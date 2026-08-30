using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WemaCoop.Api.Data;
using WemaCoop.Api.Models;
namespace WemaCoop.Api.Controllers;
[ApiController, Route("api/member"), Authorize(Roles="Member")]
public sealed class MemberPortalController(AppDbContext db, UserManager<ApplicationUser> users) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard(CancellationToken ct)
    {
        var user=await users.GetUserAsync(User); if(user is null)return Unauthorized(); var member=await db.Members.AsNoTracking().FirstOrDefaultAsync(x=>x.UserId==user.Id,ct); if(member is null)return NotFound(new{message="Member record not linked."});
        var savings=await db.SavingsAccounts.AsNoTracking().FirstOrDefaultAsync(x=>x.MemberId==member.Id,ct);var loan=await db.LoanAccounts.AsNoTracking().Where(x=>x.MemberId==member.Id&&x.Status==LoanStatus.Active).OrderByDescending(x=>x.StartDate).FirstOrDefaultAsync(ct);var tx=await db.MemberTransactions.AsNoTracking().Where(x=>x.MemberId==member.Id).OrderByDescending(x=>x.TransactionDate).Take(8).ToListAsync(ct);
        var progress=loan is null||loan.Principal<=0?0:(int)Math.Clamp((double)((loan.Principal-loan.Outstanding)/loan.Principal*100m),0,100);
        return Ok(new{member=new{member.FullName,member.MembershipNumber,member.Department},summary=new{savingsBalance=savings?.Balance??0,shareCapital=0m,outstandingLoan=loan?.Outstanding??0,nextDeduction=(savings?.MonthlyContribution??0)+(loan?.MonthlyRepayment??0)},loan=loan is null?null:new{loan.ProductName,loan.Outstanding,originalAmount=loan.Principal,loan.MonthlyRepayment,progressPercent=progress},transactions=tx.Select(x=>new{x.Description,date=x.TransactionDate.ToString("dd MMM yyyy"),x.Amount,x.Type})});
    }
}
