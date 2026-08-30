using System.Security.Cryptography;
using System.Text;
namespace WemaCoop.Api.Services;
public static class SecurityHelpers
{
    public static string CreateOpaqueToken() => Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
    public static string HashToken(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token.Trim())));
}
