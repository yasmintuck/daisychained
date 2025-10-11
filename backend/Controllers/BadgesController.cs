using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dtos;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BadgesController : ControllerBase
    {
        private readonly AppDbContext _context;

        // small, strongly-typed projection for packages to avoid anonymous/dynamic clashes
        private record PackageLite(string PackageName, string? ColorHex);

        public BadgesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /api/Badges/user/{email}
        // Returns earned badges (Progress == 2) for the given user email.
        // - BadgePath is a RELATIVE path (e.g., /assets/badges/<slug>.png)
        // - Frontend should append &origin=window.location.origin when calling the Certificates/download endpoint
        [HttpGet("user/{email}")]
        public async Task<IActionResult> GetUserBadgesByEmail(string email)
        {
            // 1) Resolve the user
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserEmail == email);

            if (user == null)
                return NotFound("User not found.");

            // 2) Fetch completed modules for this user (join to Modules for Title/Slug)
            var completed = await (from up in _context.UserProgressRecords.AsNoTracking()
                                   join m in _context.Modules.AsNoTracking() on up.ModuleId equals m.ModuleId
                                   where up.UserId == user.UserId && up.Progress == 2
                                   orderby m.ModuleTitle
                                   select new
                                   {
                                       up.ModuleId,
                                       m.ModuleTitle,
                                       m.Slug,
                                       up.CompletedAt
                                   })
                                  .ToListAsync();

            if (completed.Count == 0)
                return Ok(Array.Empty<EarnedBadgeDto>());

            // 3) Batch-load packages for those modules (ModulePackages -> Packages)
            var moduleIds = completed.Select(x => x.ModuleId).Distinct().ToList();

            var pkgRows = await (from mp in _context.ModulePackages.AsNoTracking()
                                 join p in _context.Packages.AsNoTracking() on mp.PackageId equals p.PackageId
                                 where moduleIds.Contains(mp.ModuleId)
                                 select new
                                 {
                                     mp.ModuleId,
                                     Package = new PackageLite(p.PackageName, p.ColorHex)
                                 })
                                .ToListAsync();

            var pkgsByModule = pkgRows
                .GroupBy(x => x.ModuleId)
                .ToDictionary(g => g.Key, g => g.Select(x => x.Package).ToList());

            // 4) Pick a category predictably if a module belongs to multiple packages
            var priority = new List<string>
            {
                "AI & Digital Literacy",
                "Safeguarding",
                "Personal development",
                "Cultural capital",
                "British values",
                "Next steps"
            };

            static string PickColor(string? hex) => string.IsNullOrWhiteSpace(hex) ? "#2E2B29" : hex!;

            // 5) Build DTOs
            var result = completed.Select(x =>
            {
                pkgsByModule.TryGetValue(x.ModuleId, out var list);
                var poss = list ?? new List<PackageLite>();

                var chosen = poss
                    .OrderBy(p =>
                    {
                        var idx = priority.IndexOf(p.PackageName);
                        return idx >= 0 ? idx : int.MaxValue;
                    })
                    .ThenBy(p => p.PackageName)
                    .FirstOrDefault();

                var categoryName  = chosen?.PackageName ?? "General";
                var categoryColor = PickColor(chosen?.ColorHex);

                return new EarnedBadgeDto
                {
                    ModuleId = x.ModuleId,
                    ModuleTitle = x.ModuleTitle,
                    CompletedAt = x.CompletedAt,

                    // relative path served by the frontend public folder
                    BadgePath = $"/assets/badges/{x.Slug}.png",

                    CategoryName = categoryName,
                    CategoryColorHex = categoryColor,

                    // Frontend will append &origin=<window.location.origin> when calling this
                    CertificateDownloadUrl = $"/api/Certificates/download?moduleId={x.ModuleId}"
                };
            }).ToList();

            return Ok(result);
        }
    }
}
