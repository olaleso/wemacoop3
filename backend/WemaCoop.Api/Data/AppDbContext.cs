using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WemaCoop.Api.Models;
namespace WemaCoop.Api.Data;
public sealed class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Member> Members => Set<Member>(); public DbSet<SavingsAccount> SavingsAccounts => Set<SavingsAccount>();
    public DbSet<LoanAccount> LoanAccounts => Set<LoanAccount>(); public DbSet<MemberTransaction> MemberTransactions => Set<MemberTransaction>();
    public DbSet<AccountActivation> AccountActivations => Set<AccountActivation>();
    public DbSet<MemberAuditLog> MemberAuditLogs => Set<MemberAuditLog>();
    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);
        b.Entity<Member>().HasIndex(x => x.MembershipNumber).IsUnique(); b.Entity<Member>().HasIndex(x => x.WorkEmail);
        b.Entity<Member>().HasOne(x=>x.User).WithOne().HasForeignKey<Member>(x=>x.UserId).OnDelete(DeleteBehavior.SetNull);
        b.Entity<SavingsAccount>().Property(x=>x.Balance).HasPrecision(18,2); b.Entity<SavingsAccount>().Property(x=>x.MonthlyContribution).HasPrecision(18,2);
        b.Entity<LoanAccount>().Property(x=>x.Principal).HasPrecision(18,2); b.Entity<LoanAccount>().Property(x=>x.Outstanding).HasPrecision(18,2); b.Entity<LoanAccount>().Property(x=>x.MonthlyRepayment).HasPrecision(18,2);
        b.Entity<MemberTransaction>().Property(x=>x.Amount).HasPrecision(18,2);
        b.Entity<AccountActivation>().HasIndex(x=>x.TokenHash).IsUnique();
        b.Entity<MemberAuditLog>().HasIndex(x => x.CreatedAt);
        b.Entity<MemberAuditLog>().HasOne(x => x.Member).WithMany().HasForeignKey(x => x.MemberId).OnDelete(DeleteBehavior.SetNull);
    }
}
