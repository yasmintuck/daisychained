using System.IO;
using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using QuestPDF.Fluent;          // for Document (we use it to find the assembly)
using QuestPDF.Infrastructure;  // still fine to keep
using System.Reflection;
using Microsoft.AspNetCore.Authentication.JwtBearer;

// ...

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseWebRoot("wwwroot");

// ---------- QuestPDF: register custom fonts (works across versions) ----------
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
TryRegisterFont(Path.Combine(fontsDir, "BRADHI.ttf")); // “Patrick Hand”
TryRegisterFont(Path.Combine(fontsDir, "BalooPaaji2-ExtraBold.ttf"));    // “Baloo 2”


// -------------------------
// Services
// -------------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "DaisyChained API",
        Version = "v1",
        Description = "API for DaisyChained platform",
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpClient();


builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://{builder.Configuration["Auth0:Domain"]}/";
        options.Audience  = builder.Configuration["Auth0:Audience"];
        // (optional) helpful for local clock skew:
        // options.TokenValidationParameters.ClockSkew = TimeSpan.FromMinutes(2);
    });

// -------------------------
// Pipeline
// -------------------------
var app = builder.Build();

// Swagger always enabled
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "DaisyChained API v1");
    c.RoutePrefix = "swagger";
});

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
