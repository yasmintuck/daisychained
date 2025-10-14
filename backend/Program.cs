using System.Reflection;
using System.IO;
using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using backend.Data;
using QuestPDF.Fluent;          // for Document (we use it to find the assembly)
using QuestPDF.Infrastructure;  // still fine to keep

var builder = WebApplication.CreateBuilder(args);

// Serve from /wwwroot (where backgrounds / badges live)
builder.WebHost.UseWebRoot("wwwroot");

//
// ---------- QuestPDF: register custom fonts (works across versions) ----------
//
var fontsDir = Path.Combine(builder.Environment.ContentRootPath, "Assets", "fonts");

// Helper: tries RegisterFontFromFile(string) first; falls back to RegisterFont(Stream)
static void TryRegisterFont(string path)
{
    if (!File.Exists(path)) return;

    var questAssembly = typeof(Document).Assembly; // QuestPDF core asm
    var fmType = questAssembly.GetType("QuestPDF.Infrastructure.FontManager");
    if (fmType is null) return; // very old QuestPDF without FontManager

    // Prefer: FontManager.RegisterFontFromFile(string)
    var fromFile = fmType.GetMethod(
        "RegisterFontFromFile",
        BindingFlags.Public | BindingFlags.Static,
        binder: null,
        types: new[] { typeof(string) },
        modifiers: null);

    if (fromFile is not null)
    {
        fromFile.Invoke(null, new object[] { path });
        return;
    }

    // Fallback: FontManager.RegisterFont(Stream)
    var fromStream = fmType.GetMethod(
        "RegisterFont",
        BindingFlags.Public | BindingFlags.Static,
        binder: null,
        types: new[] { typeof(Stream) },
        modifiers: null);

    if (fromStream is not null)
    {
        using var fs = File.OpenRead(path);
        fromStream.Invoke(null, new object[] { fs });
    }
}

// Register your two fonts
TryRegisterFont(Path.Combine(fontsDir, "BRADHI.ttf"));                // “Patrick Hand”
TryRegisterFont(Path.Combine(fontsDir, "BalooPaaji2-ExtraBold.ttf")); // “Baloo 2”

//
// ------------------------- Services -------------------------
//
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger (+ Bearer support so you can test with a token)
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "DaisyChained API",
        Version = "v1",
        Description = "API for DaisyChained platform",
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Paste `Bearer {token}`",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpClient();

// (Optional) CORS – allow your front-ends
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", p => p
        .WithOrigins(
            "https://daisychained.co.uk",
            "http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

//
// ------------------------- Auth (Auth0 JWT) -------------------------
//
var auth0Domain   = builder.Configuration["Auth0:Domain"];   // e.g. auth.daisychained.co.uk
var auth0Audience = builder.Configuration["Auth0:Audience"]; // e.g. https://daisychained-api

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // These two are the critical parts
        options.Authority = $"https://{auth0Domain}/";  // trailing slash required
        options.Audience  = auth0Audience;              // must match token 'aud'

        // Be explicit to avoid discovery/validation edge cases
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuer = $"https://{auth0Domain}/",
            ValidAudiences = new[] { auth0Audience },   // token 'aud' may be an array
            ClockSkew = TimeSpan.FromMinutes(2)         // avoid clock drift 401s
        };

        // TEMP DIAGNOSTICS – prints reason for 401 to logs
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = ctx =>
            {
                Console.WriteLine($"[JWT] Auth failed: {ctx.Exception?.Message}");
                return Task.CompletedTask;
            },
            OnChallenge = ctx =>
            {
                Console.WriteLine($"[JWT] Challenge: {ctx.Error} / {ctx.ErrorDescription}");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

//
// ------------------------- Pipeline -------------------------
//
var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "DaisyChained API v1");
    c.RoutePrefix = "swagger";
});

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseCors("frontend");          // if you enabled the CORS policy above

app.UseAuthentication();          // Authentication must come before Authorization
app.UseAuthorization();

app.MapControllers();

app.Run();
