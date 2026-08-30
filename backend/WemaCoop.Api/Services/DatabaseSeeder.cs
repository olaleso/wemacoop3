using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WemaCoop.Api.Data;
using WemaCoop.Api.Models;
namespace WemaCoop.Api.Services;
public sealed class DatabaseSeeder(AppDbContext db, RoleManager<IdentityRole<Guid>> roleManager, UserManager<ApplicationUser> userManager, IConfiguration config, IHostEnvironment env)
{
    public async Task SeedAsync(CancellationToken ct=default)
    {
        foreach (var role in new[]{"Admin","Member"}) if(!await roleManager.RoleExistsAsync(role)) await roleManager.CreateAsync(new IdentityRole<Guid>(role));
        var adminEmail=config["SeedAdmin:Email"]; var adminPassword=config["SeedAdmin:Password"];
        if(!string.IsNullOrWhiteSpace(adminEmail)&&!string.IsNullOrWhiteSpace(adminPassword)&&await userManager.FindByEmailAsync(adminEmail) is null){var u=new ApplicationUser{UserName=adminEmail,Email=adminEmail,FullName="Initial Administrator",EmailConfirmed=true,MustChangePassword=true};var r=await userManager.CreateAsync(u,adminPassword);if(r.Succeeded)await userManager.AddToRoleAsync(u,"Admin");}
        if(env.IsDevelopment() && config.GetValue("SeedDemoData",true) && !await db.Members.AnyAsync(ct))
        {
            var m=new Member{MembershipNumber="WMC/0001",StaffId="TEST001",FullName="Development Member",WorkEmail="member@wemacoop.test",Department="Operations",Status=MemberStatus.Active,DateJoined=new DateOnly(2024,1,1)};
            db.Members.Add(m); db.SavingsAccounts.Add(new SavingsAccount{Member=m,Balance=1840000,MonthlyContribution=75000});
            db.LoanAccounts.Add(new LoanAccount{Member=m,ProductName="Normal Loan",Principal=1200000,Outstanding=675000,MonthlyRepayment=85000,StartDate=new DateOnly(2026,1,1),EndDate=new DateOnly(2027,3,1),Status=LoanStatus.Active});
            db.MemberTransactions.AddRange(new MemberTransaction{Member=m,Description="Monthly contribution",Type="Savings",Amount=75000,TransactionDate=DateTimeOffset.UtcNow.AddDays(-2)},new MemberTransaction{Member=m,Description="Loan repayment",Type="Loan",Amount=-85000,TransactionDate=DateTimeOffset.UtcNow.AddDays(-2)});
            await db.SaveChangesAsync(ct);
        }
    }
}
