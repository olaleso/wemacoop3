namespace WemaCoop.Api.Models;
public enum MemberStatus { Pending = 0, Active = 1, Suspended = 2, Exited = 3 }
public sealed class Member
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? UserId { get; set; }
    public ApplicationUser? User { get; set; }
    public string MembershipNumber { get; set; } = string.Empty;
    public string? StaffId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string WorkEmail { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Department { get; set; }
    public DateOnly? DateJoined { get; set; }
    public MemberStatus Status { get; set; } = MemberStatus.Active;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset LastUpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
public sealed class SavingsAccount
{
    public Guid Id { get; set; } = Guid.NewGuid(); public Guid MemberId { get; set; } public Member Member { get; set; } = null!;
    public decimal Balance { get; set; } public decimal MonthlyContribution { get; set; } public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
public enum LoanStatus { Pending = 0, Active = 1, Repaid = 2, Declined = 3 }
public sealed class LoanAccount
{
    public Guid Id { get; set; } = Guid.NewGuid(); public Guid MemberId { get; set; } public Member Member { get; set; } = null!;
    public string ProductName { get; set; } = string.Empty; public decimal Principal { get; set; } public decimal Outstanding { get; set; }
    public decimal MonthlyRepayment { get; set; } public DateOnly StartDate { get; set; } public DateOnly? EndDate { get; set; } public LoanStatus Status { get; set; }
}
public sealed class MemberTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid(); public Guid MemberId { get; set; } public Member Member { get; set; } = null!;
    public string Description { get; set; } = string.Empty; public string Type { get; set; } = string.Empty; public decimal Amount { get; set; }
    public DateTimeOffset TransactionDate { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class MemberAuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? MemberId { get; set; }
    public Member? Member { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public Guid? ActorUserId { get; set; }
    public string ActorName { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
