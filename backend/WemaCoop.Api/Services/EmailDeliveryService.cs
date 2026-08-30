namespace WemaCoop.Api.Services;
public interface IEmailDeliveryService
{
    Task SendActivationAsync(string email, string fullName, string token, CancellationToken ct);
    Task SendPasswordResetAsync(string email, string fullName, string token, CancellationToken ct);
}
public sealed class DevelopmentEmailDeliveryService(ILogger<DevelopmentEmailDeliveryService> logger) : IEmailDeliveryService
{
    public Task SendActivationAsync(string email,string fullName,string token,CancellationToken ct){logger.LogWarning("DEV activation token for {Email}: {Token}",email,token);return Task.CompletedTask;}
    public Task SendPasswordResetAsync(string email,string fullName,string token,CancellationToken ct){logger.LogWarning("DEV password reset token for {Email}: {Token}",email,token);return Task.CompletedTask;}
}
