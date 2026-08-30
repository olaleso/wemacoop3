using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WemaCoop.Api.Data;
using WemaCoop.Api.Models;
using WemaCoop.Api.Services;
var builder=WebApplication.CreateBuilder(args);
var isDev=builder.Environment.IsDevelopment();
builder.Services.AddDbContext<AppDbContext>(o=>o.UseNpgsql(builder.Configuration.GetConnectionString("WemaCoop")));
builder.Services.AddIdentity<ApplicationUser,IdentityRole<Guid>>(o=>{o.Password.RequiredLength=10;o.Password.RequireUppercase=true;o.Password.RequireLowercase=true;o.Password.RequireDigit=true;o.Password.RequireNonAlphanumeric=true;o.Lockout.MaxFailedAccessAttempts=5;o.Lockout.DefaultLockoutTimeSpan=TimeSpan.FromMinutes(15);o.User.RequireUniqueEmail=true;}).AddEntityFrameworkStores<AppDbContext>().AddDefaultTokenProviders();
builder.Services.ConfigureApplicationCookie(o=>{o.Cookie.Name="__Host-WemaCoop.Auth";o.Cookie.HttpOnly=true;o.Cookie.SecurePolicy=CookieSecurePolicy.Always;o.Cookie.SameSite=isDev?SameSiteMode.None:SameSiteMode.Lax;o.Cookie.Path="/";o.ExpireTimeSpan=TimeSpan.FromMinutes(30);o.SlidingExpiration=true;o.Events.OnRedirectToLogin=c=>{c.Response.StatusCode=StatusCodes.Status401Unauthorized;return Task.CompletedTask;};o.Events.OnRedirectToAccessDenied=c=>{c.Response.StatusCode=StatusCodes.Status403Forbidden;return Task.CompletedTask;};});
builder.Services.Configure<SecurityStampValidatorOptions>(o=>o.ValidationInterval=TimeSpan.Zero);
builder.Services.AddAntiforgery(o=>{o.HeaderName="X-CSRF-TOKEN";o.Cookie.Name="__Host-WemaCoop.Csrf";o.Cookie.HttpOnly=true;o.Cookie.SecurePolicy=CookieSecurePolicy.Always;o.Cookie.SameSite=isDev?SameSiteMode.None:SameSiteMode.Lax;o.Cookie.Path="/";});
builder.Services.AddControllers(o=>o.Filters.Add(new AutoValidateAntiforgeryTokenAttribute()))
    .AddJsonOptions(o=>o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddProblemDetails();
var origins=builder.Configuration.GetSection("PortalOrigins").Get<string[]>()??[];builder.Services.AddCors(o=>o.AddPolicy("Portal",p=>{if(origins.Length>0)p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();}));
builder.Services.AddAuthorization(o=>{o.AddPolicy("AdminOnly",p=>p.RequireRole("Admin"));o.AddPolicy("MemberOnly",p=>p.RequireRole("Member"));});
builder.Services.AddRateLimiter(o=>o.AddFixedWindowLimiter("auth",x=>{x.PermitLimit=8;x.Window=TimeSpan.FromMinutes(1);x.QueueLimit=0;x.AutoReplenishment=true;}));
builder.Services.AddScoped<IEmailDeliveryService,DevelopmentEmailDeliveryService>();builder.Services.AddScoped<DatabaseSeeder>();
var app=builder.Build();app.UseExceptionHandler();if(!isDev){app.UseHsts();}app.UseHttpsRedirection();app.UseCors("Portal");app.UseRateLimiter();app.UseAuthentication();app.UseAuthorization();app.MapControllers();
if(isDev||builder.Configuration.GetValue("RunSeeder",false)){using var scope=app.Services.CreateScope();await scope.ServiceProvider.GetRequiredService<DatabaseSeeder>().SeedAsync();}
app.MapGet("/health",()=>Results.Ok(new{status="ok",utc=DateTimeOffset.UtcNow}));app.Run();
