namespace WemaCoop.Api.Contracts;
public sealed record LoginRequest(string Identifier, string Password, bool RememberMe);
public sealed record ActivationRequest(string MembershipNumber, string Email);
public sealed record ActivationCompleteRequest(string Token, string Password);
public sealed record ForgotPasswordRequest(string Identifier);
public sealed record ResetPasswordRequest(string Identifier, string Token, string Password);

public sealed record ChangePasswordRequest(string CurrentPassword, string NewPassword);
