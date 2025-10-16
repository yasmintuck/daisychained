using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using backend.Infrastructure;
using backend.Data;
using QuestPDF.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using QuestPDF.Drawing;
using System.Linq;
using System.Text.RegularExpressions;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CertificatesController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;

        // We no longer need IHttpClientFactory since we read from disk
        public CertificatesController(AppDbContext db, IWebHostEnvironment env)
        {
            _db  = db;
            _env = env;
        }

        // GET /api/Certificates/download?moduleId=123
        // Dev-only helper: &debugEmail=<you@domain> (works only in Development)
        [Authorize]
        [HttpGet("download")]
        public async Task<IActionResult> Download(
            [FromQuery] int moduleId,
            [FromQuery] string? debugEmail)
        {
            // 1) Caller identity (JWT), with dev-only override
            var email = GetEmailFromToken(User);

            if (string.IsNullOrWhiteSpace(email) && _env.IsDevelopment() && !string.IsNullOrWhiteSpace(debugEmail))
                email = debugEmail.Trim();

            if (string.IsNullOrWhiteSpace(email))
                return Unauthorized("User identity not found.");

            // 2) Confirm completion
            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.UserEmail == email);
            if (user == null) return NotFound("User not found.");

            var progress = await _db.UserProgressRecords
                .Include(up => up.Module)
                .AsNoTracking()
                .FirstOrDefaultAsync(up => up.UserId == user.UserId
                                           && up.ModuleId == moduleId
                                           && up.Progress == 2);
            if (progress == null) return Forbid("You have not completed this module.");

            var module       = progress.Module!;
            var completedAt  = progress.CompletedAt ?? DateTime.UtcNow;

            // 3) Choose a category (via Packages)
            var pkgRows = await (from mp in _db.ModulePackages.AsNoTracking()
                                 join p in _db.Packages.AsNoTracking() on mp.PackageId equals p.PackageId
                                 where mp.ModuleId == module.ModuleId
                                 select new { p.PackageName, p.ColorHex })
                                .ToListAsync();

            var priority = new List<string>
            {
                "AI & Digital Literacy",
                "Safeguarding",
                "Personal development",
                "Cultural capital",
                "British values",
                "Next steps"
            };

            var chosen = pkgRows
                .OrderBy(p => { var i = priority.IndexOf(p.PackageName); return i >= 0 ? i : int.MaxValue; })
                .ThenBy(p => p.PackageName)
                .FirstOrDefault();

            var categoryName  = chosen?.PackageName ?? "General";
            var categoryColor = string.IsNullOrWhiteSpace(chosen?.ColorHex) ? "#2E2B29" : chosen!.ColorHex!;

            // 4) Resolve asset file paths from wwwroot
            var webRoot = _env.WebRootPath; // should be .../backend/wwwroot

            // ---- background (single known file name) ----
            var bgCandidates = new[]
            {
                Path.Combine(webRoot, "certificates", "backgrounds", "default-certificate-bg.png"),
                Path.Combine(webRoot, "certificates", "backgrounds", "default-certificate-bg.PNG"),
            };

            // ---- badge (robust slug → filename mapping) ----
            string rawSlug = module.Slug ?? string.Empty;

            // trim + collapse internal whitespace
            string s1 = Regex.Replace(rawSlug.Trim(), @"\s+", " ");

            // strip characters invalid for filenames and some usual punctuation
            string cleaned = Regex.Replace(s1, @"[^A-Za-z0-9 _\-]", "");

            // variants
            string lower            = cleaned.ToLowerInvariant();
            string spaceToDash      = cleaned.Replace(' ', '-');
            string spaceToDashLower = lower.Replace(' ', '-');
            string spaceToUnder     = cleaned.Replace(' ', '_');
            string spaceToUnderLow  = lower.Replace(' ', '_');

            var badgeDir = Path.Combine(webRoot, "assets", "badges");
            var badgeCandidates = new[]
            {
                Path.Combine(badgeDir, $"{cleaned}.png"),
                Path.Combine(badgeDir, $"{cleaned}.PNG"),
                Path.Combine(badgeDir, $"{lower}.png"),
                Path.Combine(badgeDir, $"{lower}.PNG"),
                Path.Combine(badgeDir, $"{spaceToDash}.png"),
                Path.Combine(badgeDir, $"{spaceToDash}.PNG"),
                Path.Combine(badgeDir, $"{spaceToDashLower}.png"),
                Path.Combine(badgeDir, $"{spaceToDashLower}.PNG"),
                Path.Combine(badgeDir, $"{spaceToUnder}.png"),
                Path.Combine(badgeDir, $"{spaceToUnder}.PNG"),
                Path.Combine(badgeDir, $"{spaceToUnderLow}.png"),
                Path.Combine(badgeDir, $"{spaceToUnderLow}.PNG"),
            };

            // pick the first that exists
            string? bgPath    = bgCandidates.FirstOrDefault(System.IO.File.Exists);
            string? badgePath = badgeCandidates.FirstOrDefault(System.IO.File.Exists);

            // ---------- TEMP DIAGNOSTICS ----------
            Console.WriteLine($"webRoot:   {webRoot}");
            Console.WriteLine($"rawSlug:   '{rawSlug}'  -> cleaned: '{cleaned}'");
            Console.WriteLine($"bgPath:    {bgPath}    exists: {System.IO.File.Exists(bgPath ?? string.Empty)}");
            Console.WriteLine($"badgePath: {badgePath}   exists: {System.IO.File.Exists(badgePath ?? string.Empty)}");

            // If not found, dump a quick directory listing so we can see what the API can see
            if (bgPath is null || !System.IO.File.Exists(bgPath))
            {
                var bgDir = Path.Combine(webRoot, "certificates", "backgrounds");
                Console.WriteLine($"[diag] backgrounds dir: {bgDir}");
                if (Directory.Exists(bgDir))
                    foreach (var f in Directory.GetFiles(bgDir, "*.*", SearchOption.TopDirectoryOnly))
                        Console.WriteLine($"[diag] bg file: {Path.GetFileName(f)}");
                else
                    Console.WriteLine("[diag] backgrounds dir DOES NOT EXIST");
            }

            if (badgePath is null || !System.IO.File.Exists(badgePath))
            {
                Console.WriteLine($"[diag] badges dir: {badgeDir}");
                if (Directory.Exists(badgeDir))
                    foreach (var f in Directory.GetFiles(badgeDir, "*.png", SearchOption.TopDirectoryOnly))
                        Console.WriteLine($"[diag] badge file: {Path.GetFileName(f)}");
                else
                    Console.WriteLine("[diag] badges dir DOES NOT EXIST");
            }
            // ---------- END DIAGNOSTICS ----------

            // read bytes (null if not found)
            byte[]? backgroundPng = (bgPath != null && System.IO.File.Exists(bgPath))
                ? await System.IO.File.ReadAllBytesAsync(bgPath)
                : null;

            byte[]? badgePng = (badgePath != null && System.IO.File.Exists(badgePath))
                ? await System.IO.File.ReadAllBytesAsync(badgePath)
                : null;


            // 5) Learner name: DB first/last -> token namespaced "name" -> plain "name" -> email
            var fullDbName = $"{user.UserFirstName} {user.UserLastName}".Trim();
            var tokenName  = GetNameFromToken(User);
            var learnerName = string.IsNullOrWhiteSpace(fullDbName)
                ? (tokenName ?? email)
                : fullDbName;

            Console.WriteLine($"[cert] email={email}, learnerName={learnerName}, moduleId={moduleId}");

            // 6) Register fonts (safe to call repeatedly)
            QuestPDF.Settings.License = LicenseType.Community;

            try
            {
                var fontsDir = Path.Combine(webRoot, "fonts");

                // Bradley Hand ITC (file BRADHI.ttf)
                var bradley = Path.Combine(fontsDir, "BRADHI.ttf");
                if (System.IO.File.Exists(bradley))
                    FontManager.RegisterFont(System.IO.File.OpenRead(bradley));

                // Baloo Paaji 2 ExtraBold (file BalooPaaji2-ExtraBold.ttf)
                var baloo = Path.Combine(fontsDir, "BalooPaaji2-ExtraBold.ttf");
                if (System.IO.File.Exists(baloo))
                    FontManager.RegisterFont(System.IO.File.OpenRead(baloo));
            }
            catch { /* ignore if already registered / any IO issues */ }

            // 7) Render PDF (same layout you already had, just fed with bytes + font families)
            var pdf = BuildCertificatePdf(
                learnerName, module.ModuleTitle, categoryName, categoryColor, completedAt, badgePng, backgroundPng);

            var safeFile = Sanitize($"daisychained-{module.ModuleTitle}-{completedAt:dd-MM-yy}.pdf");
            return File(pdf, "application/pdf", safeFile);
        }

        private static string Sanitize(string s)
        {
            var bad = Path.GetInvalidFileNameChars();
            return string.Join("-", s.Split(bad, StringSplitOptions.RemoveEmptyEntries)).Trim();
        }
        
        // ===== Claims helpers (Option A) =====
        private static string? GetEmailFromToken(ClaimsPrincipal user)
        {
            const string NsEmail = "https://daisychained.co.uk/claims/email";
            return user.FindFirst(NsEmail)?.Value
                ?? user.FindFirst("email")?.Value
                ?? user.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;
        }

        private static string? GetNameFromToken(ClaimsPrincipal user)
        {
            const string NsName = "https://daisychained.co.uk/claims/name";
            return user.FindFirst(NsName)?.Value
                ?? user.FindFirst("name")?.Value;
        }


        private static byte[] BuildCertificatePdf(
            string learnerName,
            string moduleTitle,
            string categoryName,
            string categoryColorHex,
            DateTime completedAt,
            byte[]? badgePng,
            byte[]? backgroundPng)
        {
            // ===== Layout tuning (A4 portrait) =====
            const float StripWidth = 170;  // left colour strip width (behind PNG)
            const float TopPad = 240;

            const float GlobalNudgeX = 0f;

            // Font sizes
            const float NameSize = 20;   // Bradley Hand ITC
            const float CatSize = 16;   // Baloo Paaji 2 (ExtraBold)
            const float DateSize = 12;   // Bradley Hand ITC
            const float BadgeBox = 120;

            // Vertical rhythm
            const float SpaceAfterName = 100;
            const float SpaceAfterBadge = 95;
            const float SpaceAfterCat = 50;

            // Per-item nudges
            const float NameNudgeX = 70f;
            const float NameNudgeY = 0f;
            const float BadgeNudgeX = 0f;
            const float BadgeNudgeY = 0f;
            const float CategoryNudgeX = 75f;
            const float CategoryNudgeY = -2f;
            const float DateNudgeX = 25f;
            const float DateNudgeY = 0f;

            var panelColor = string.IsNullOrWhiteSpace(categoryColorHex) ? "#2E2B29" : categoryColorHex;

            var doc = Document.Create(c =>
            {
                c.Page(p =>
                {
                    p.Size(PageSizes.A4);
                    p.Margin(0);

                    // BACKGROUND: strip + template
                    p.Background().Layers(l =>
                    {
                        l.Layer().Element(e =>
                            e.AlignLeft()
                             .Width(StripWidth)
                             .Height(PageSizes.A4.Height)
                             .Background(panelColor)
                        );

                        if (backgroundPng != null)
                            l.PrimaryLayer().Image(backgroundPng).FitArea();
                        else
                            l.PrimaryLayer().Element(_ => { });
                    });

                    // FOREGROUND: dynamic content
                    p.Content()
                     .PaddingTop(TopPad)
                     .PaddingHorizontal(72)
                     .Element(e => e.TranslateX(GlobalNudgeX))
                     .Column(col =>
                     {
                         // NAME
                         col.Item()
                            .Element(e => e.TranslateX(NameNudgeX).TranslateY(NameNudgeY))
                            .AlignCenter()
                            .Text(learnerName)
                                .FontFamily("Bradley Hand ITC TT")   // comes from BRADHI.ttf
                                .FontSize(NameSize)
                                .Bold()
                                .FontColor("#2C2C2C");

                         col.Item().Height(SpaceAfterName);

                         // BADGE
                         if (badgePng != null)
                         {
                             col.Item()
                                .Element(e => e.TranslateX(BadgeNudgeX).TranslateY(BadgeNudgeY))
                                .AlignCenter()
                                .Width(BadgeBox).Height(BadgeBox)
                                .Image(badgePng);
                         }

                         col.Item().Height(SpaceAfterBadge);

                         // CATEGORY
                         col.Item()
                            .Element(e => e.TranslateX(CategoryNudgeX).TranslateY(CategoryNudgeY))
                            .AlignCenter()
                            .Text(categoryName)
                                .FontFamily("Baloo Paaji 2 ExtraBold")
                                .FontSize(CatSize)
                                .Bold()
                                .FontColor("#2C2C2C");

                         col.Item().Height(SpaceAfterCat);

                         // DATE
                         col.Item()
                            .Element(e => e.TranslateX(DateNudgeX).TranslateY(DateNudgeY))
                            .AlignCenter()
                            .Text($"{completedAt:dd'/'MM'/'yy}")
                                .FontFamily("Bradley Hand ITC TT")
                                .FontSize(DateSize)
                                .FontColor("#666666");
                     });
                });
            });

            return doc.GeneratePdf();
        }
    }
}
