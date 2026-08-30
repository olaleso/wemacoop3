using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using WemaCoop.Api.Contracts;
using WemaCoop.Api.Data;
using WemaCoop.Api.Models;
using WemaCoop.Api.Services;
namespace WemaCoop.Api.Controllers;
[ApiController, Route("api/auth")]
public sealed class AuthController(UserManager<ApplicationUser> users, SignInManager<ApplicationUser> signIn, AppDbContext db, IAntiforgery antiforgery, IEmailDeliveryService email, IHostEnvironment env) : ControllerBase
{
    [HttpGet("csrf"), AllowAnonymous] public IActionResult Csrf(){var t=antiforgery.GetAndStoreTokens(HttpContext);return Ok(new{token=t.RequestToken});}
    [HttpPost("login"), AllowAnonymous, EnableRateLimiting("auth")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var id=req.Identifier.Trim(); var user=await users.FindByEmailAsync(id) ?? await users.FindByNameAsync(id);
        if(user is null || !user.IsActive) return Unauthorized(new{message="Invalid sign-in details."});
        var result=await signIn.PasswordSignInAsync(user,req.Password,req.RememberMe,lockoutOnFailure:true);
        if(result.IsLockedOut) return StatusCode(423,new{message="Account temporarily locked after repeated failed sign-in attempts."});
        if(!result.Succeeded) return Unauthorized(new{message="Invalid sign-in details."});
        user.LastLoginAt=DateTimeOffset.UtcNow; await users.UpdateAsync(user); var roles=await users.GetRolesAsync(user); var role=roles.Contains("Admin")?"Admin":"Member";
        return Ok(new{user.FullName,user.Email,role,user.MustChangePassword});
    }
    [HttpPost("logout"), Authorize] public async Task<IActionResult> Logout(){await signIn.SignOutAsync();return Ok(new{message="Signed out."});}
    [HttpGet("me"), Authorize] public async Task<IActionResult> Me(){var user=await users.GetUserAsync(User);if(user is null)return Unauthorized();var roles=await users.GetRolesAsync(user);return Ok(new{user.FullName,user.Email,role=roles.Contains("Admin")?"Admin":"Member",user.MustChangePassword});}
    [HttpPost("activation/request"), AllowAnonymous, EnableRateLimiting("auth")]
    public async Task<IActionResult> RequestActivation(ActivationRequest req,CancellationToken ct)
    {
        var number=req.MembershipNumber.Trim().ToUpperInvariant();var mail=req.Email.Trim().ToLowerInvariant();var member=await db.Members.FirstOrDefaultAsync(x=>x.MembershipNumber.ToUpper()==number && x.WorkEmail.ToLower()==mail,ct);
        if(member is null || member.Status!=MemberStatus.Active || member.UserId is not null) return Ok(new{message="If the details match an eligible member record, activation instructions will be sent."});
        var oldTokens=await db.AccountActivations.Where(x=>x.MemberId==member.Id && x.UsedAt==null).ToListAsync(ct);if(oldTokens.Count>0)db.AccountActivations.RemoveRange(oldTokens);
        var raw=SecurityHelpers.CreateOpaqueToken();db.AccountActivations.Add(new AccountActivation{MemberId=member.Id,TokenHash=SecurityHelpers.HashToken(raw),ExpiresAt=DateTimeOffset.UtcNow.AddMinutes(30)});await db.SaveChangesAsync(ct);await email.SendActivationAsync(member.WorkEmail,member.FullName,raw,ct);
        return Ok(new{message="If the details match an eligible member record, activation instructions will be sent.",developmentToken=env.IsDevelopment()?raw:null});
    }
    [HttpPost("activation/complete"), AllowAnonymous, EnableRateLimiting("auth")]
    public async Task<IActionResult> CompleteActivation(ActivationCompleteRequest req,CancellationToken ct)
    {
        var hash=SecurityHelpers.HashToken(req.Token);var a=await db.AccountActivations.Include(x=>x.Member).FirstOrDefaultAsync(x=>x.TokenHash==hash,ct);if(a is null||a.UsedAt is not null||a.ExpiresAt<DateTimeOffset.UtcNow)return BadRequest(new{message="Activation token is invalid or expired."});if(a.Member.UserId is not null)return BadRequest(new{message="This member account is already activated."});
        var u=new ApplicationUser{UserName=a.Member.MembershipNumber,Email=a.Member.WorkEmail,FullName=a.Member.FullName,EmailConfirmed=true,PhoneNumber=a.Member.PhoneNumber};var result=await users.CreateAsync(u,req.Password);if(!result.Succeeded)return BadRequest(new{message="Password does not meet the security requirements.",errors=result.Errors.Select(x=>x.Description)});await users.AddToRoleAsync(u,"Member");a.Member.UserId=u.Id;a.Member.LastUpdatedAt=DateTimeOffset.UtcNow;a.UsedAt=DateTimeOffset.UtcNow;await db.SaveChangesAsync(ct);return Ok(new{message="Your member account has been activated. You can now sign in."});
    }
    [HttpPost("password/forgot"), AllowAnonymous, EnableRateLimiting("auth")]
    public async Task<IActionResult> Forgot(ForgotPasswordRequest req,CancellationToken ct)
    {
        var id=req.Identifier.Trim();var user=await users.FindByEmailAsync(id)??await users.FindByNameAsync(id);string? dev=null;if(user is not null&&user.IsActive&&user.Email is not null){var token=await users.GeneratePasswordResetTokenAsync(user);await email.SendPasswordResetAsync(user.Email,user.FullName,token,ct);if(env.IsDevelopment())dev=token;}return Ok(new{message="If an active account matches those details, password reset instructions will be sent.",developmentToken=dev});
    }
    [HttpPost("password/reset"), AllowAnonymous, EnableRateLimiting("auth")]
    public async Task<IActionResult> Reset(ResetPasswordRequest req)
    {
        var id=req.Identifier.Trim();var user=await users.FindByEmailAsync(id)??await users.FindByNameAsync(id);
        if(user is null || !user.IsActive) return BadRequest(new{message="Reset token is invalid or expired."});
        var result=await users.ResetPasswordAsync(user,req.Token,req.Password);
        if(!result.Succeeded) return BadRequest(new{message="Reset token is invalid, expired, or the new password does not meet the security requirements.",errors=result.Errors.Select(x=>x.Description)});
        user.MustChangePassword=false; await users.UpdateAsync(user);
        return Ok(new{message="Your password has been reset. You can now sign in."});
    }
    [HttpPost("password/change"), Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest req)
    {
        var user = await users.GetUserAsync(User);
        if (user is null || !user.IsActive) return Unauthorized();

        var result = await users.ChangePasswordAsync(user, req.CurrentPassword, req.NewPassword);
        if (!result.Succeeded)
            return BadRequest(new
            {
                message = "Password could not be changed. Check your current password and the new password requirements.",
                errors = result.Errors.Select(x => x.Description)
            });

        user.MustChangePassword = false;
        await users.UpdateAsync(user);
        await signIn.RefreshSignInAsync(user);
        var roles = await users.GetRolesAsync(user);
        return Ok(new { message = "Password changed successfully.", role = roles.Contains("Admin") ? "Admin" : "Member" });
    }

}
