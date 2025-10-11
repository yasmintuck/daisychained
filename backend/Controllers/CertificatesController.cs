using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using backend.Data;
using QuestPDF.Helpers;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CertificatesController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IHttpClientFactory _httpFactory;
        private readonly IHostEnvironment _env;

        public CertificatesController(AppDbContext db, IHttpClientFactory httpFactory, IHostEnvironment env)
        {
            _db = db;
            _httpFactory = httpFactory;
            _env = env;
        }

        // GET /api/Certificates/download?moduleId=123&origin=https://your-frontend
        // Dev-only helper: &debugEmail=<your@email> (works only when ASPNETCORE_ENVIRONMENT=Development)
        [HttpGet("download")]
        public async Task<IActionResult> Download(
            [FromQuery] int moduleId,
            [FromQuery] string? origin,
            [FromQuery] string? debugEmail)
        {
            // 1) Caller identity (JWT), with dev-only override for Swagger testing
            var email = User.FindFirst("email")?.Value;
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

            var module = progress.Module!;
            var completedAt = progress.CompletedAt ?? DateTime.UtcNow;

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

            // 4) Asset URLs based on frontend origin
            origin = NormalizeOrigin(origin, Request.Headers.Referer.ToString());
            if (origin == null) return BadRequest("Missing origin.");

            var badgeUrl    = $"{origin}/assets/badges/{module.Slug}.png";
            var templateUrl = $"{origin}/assets/certificates/default-certificate-bg.png";

            // 5) Fetch images (only accept image/*)
            var http = _httpFactory.CreateClient();
            byte[]? badgeBytes = await TryGetBytes(http, badgeUrl);
            byte[]? backgroundBytes = await TryGetBytes(http, templateUrl);

            // 6) Learner name: DB first/last -> token "name" -> email
            var fullDbName = $"{user.UserFirstName} {user.UserLastName}".Trim();
            var learnerName = string.IsNullOrWhiteSpace(fullDbName)
                ? (User.FindFirst("name")?.Value ?? email)
                : fullDbName;

            // 7) Render PDF
            QuestPDF.Settings.License = LicenseType.Community;
            var pdf = BuildCertificatePdf(
                learnerName, module.ModuleTitle, categoryName, categoryColor, completedAt, badgeBytes, backgroundBytes);

            var safeFile = Sanitize($"daisychained-{module.ModuleTitle}-{completedAt:dd-MM-yy}.pdf");
            return File(pdf, "application/pdf", safeFile);
        }

        private static async Task<byte[]?> TryGetBytes(HttpClient http, string url)
        {
            try
            {
                using var resp = await http.GetAsync(url);
                if (!resp.IsSuccessStatusCode) return null;

                var mediaType = resp.Content.Headers.ContentType?.MediaType ?? "";
                if (!mediaType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                    return null;

                return await resp.Content.ReadAsByteArrayAsync();
            }
            catch
            {
                return null;
            }
        }

        private static string? NormalizeOrigin(string? origin, string referer)
        {
            if (!string.IsNullOrWhiteSpace(origin) && Uri.TryCreate(origin, UriKind.Absolute, out var o))
                return $"{o.Scheme}://{o.Host}{(o.IsDefaultPort ? "" : ":" + o.Port)}";

            if (!string.IsNullOrWhiteSpace(referer) && Uri.TryCreate(referer, UriKind.Absolute, out var r))
                return $"{r.Scheme}://{r.Host}{(r.IsDefaultPort ? "" : ":" + r.Port)}";

            return null;
        }

        private static string Sanitize(string s)
        {
            var bad = Path.GetInvalidFileNameChars();
            return string.Join("-", s.Split(bad, StringSplitOptions.RemoveEmptyEntries)).Trim();
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
            const float StripWidth     = 170;  // left colour strip width (behind PNG)
            const float TopPad         = 240;

            // Global column offset (optional). Positive -> whole column moves right.
            const float GlobalNudgeX   = 0f;

            // Font sizes
            const float NameSize       = 20;   // Bradley Hand ITC
            const float CatSize        = 16;   // Baloo 2 ExtraBold
            const float DateSize       = 12;   // Bradley Hand ITC
            const float BadgeBox       = 120;

            // Vertical rhythm
            const float SpaceAfterName  = 100;
            const float SpaceAfterBadge = 95;
            const float SpaceAfterCat   = 50;

            // ===== Per-item nudges (in points/pixels) =====
            // Positive X = move right, negative X = move left
            // Positive Y = move down,  negative Y = move up
            const float NameNudgeX     =  70f;   // tweak freely
            const float NameNudgeY     =   0f;

            const float BadgeNudgeX    =   0f;
            const float BadgeNudgeY    =   0f;

            const float CategoryNudgeX =  75f;
            const float CategoryNudgeY =  -2f;

            const float DateNudgeX     =  25f;
            const float DateNudgeY     =   0f;

            var panelColor = string.IsNullOrWhiteSpace(categoryColorHex) ? "#2E2B29" : categoryColorHex;

            var doc = Document.Create(c =>
            {
                c.Page(p =>
                {
                    p.Size(PageSizes.A4);
                    p.Margin(0);

                    // BACKGROUND: strip behind, background template above it
                    p.Background().Layers(l =>
                    {
                        // left colour strip (behind)
                        l.Layer().Element(e =>
                            e.AlignLeft()
                             .Width(StripWidth)
                             .Height(PageSizes.A4.Height)
                             .Background(panelColor)
                        );

                        // template image (on top of strip)
                        if (backgroundPng != null)
                            l.PrimaryLayer().Image(backgroundPng).FitArea();
                        else
                            l.PrimaryLayer().Element(_ => { });
                    });

                    // FOREGROUND: dynamic content only
                    p.Content()
                     .PaddingTop(TopPad)
                     .PaddingHorizontal(72)
                     .Element(e => e.TranslateX(GlobalNudgeX)) // global column nudge
                     .Column(col =>
                     {
                         // NAME
                         col.Item()
                            .Element(e => e.TranslateX(NameNudgeX).TranslateY(NameNudgeY))
                            .AlignCenter()
                            .Text(learnerName)
                                .FontFamily("Bradley Hand ITC")   // ensure registered in Program.cs
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
                                .FontFamily("Baloo Paaji 2")      // your Baloo family name
                                .FontSize(CatSize)
                                .Bold()
                                .FontColor("#2C2C2C");

                         col.Item().Height(SpaceAfterCat);

                         // DATE
                         col.Item()
                            .Element(e => e.TranslateX(DateNudgeX).TranslateY(DateNudgeY))
                            .AlignCenter()
                            .Text($"{completedAt:dd'/'MM'/'yy}")
                                .FontFamily("Bradley Hand ITC")
                                .FontSize(DateSize)
                                .FontColor("#666666");
                     });
                });
            });

            return doc.GeneratePdf();
        }
    }
}
