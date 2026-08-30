using WemaCoop.Api.Models;

namespace WemaCoop.Api.Contracts;

public sealed record CreateMemberRequest(
    string MembershipNumber,
    string FullName,
    string WorkEmail,
    string? StaffId,
    string? PhoneNumber,
    string? Department,
    DateOnly? DateJoined);

public sealed record UpdateMemberRequest(
    string MembershipNumber,
    string FullName,
    string WorkEmail,
    string? StaffId,
    string? PhoneNumber,
    string? Department,
    DateOnly? DateJoined);

public sealed record ChangeMemberStatusRequest(MemberStatus Status, string? Reason);
