using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Dtos;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserAccessController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly backend.Infrastructure.CacheKeyStore _keyStore;

    public UserAccessController(AppDbContext context, IMemoryCache cache, backend.Infrastructure.CacheKeyStore keyStore)
    {
        _context = context;
        _cache = cache;
        _keyStore = keyStore;
    }

    // POST: api/UserAccess/packages
    // Body: { email, firstName?, lastName?, externalId? }
    // Returns the list of Packages the user's org can access.
    [HttpPost("packages")]
    public async Task<ActionResult<IEnumerable<object>>> GetAllowedPackages([FromBody] AuthUserDto authUser)
    {
        if (authUser == null || string.IsNullOrWhiteSpace(authUser.Email))
            return BadRequest("Email is required.");

        var domain = authUser.Email.Split('@').Last().Trim().ToLower();

        // Project packages for the organisation directly to avoid loading full entity graph
        var org = await _context.Organisations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Domain.ToLower() == domain);

        if (org == null)
            return Ok(new List<object>());

        // Cache packages per-organisation to avoid repeated joins
        var pkgCacheKey = $"org_packages_{org.OrganisationId}";
        if (!_cache.TryGetValue(pkgCacheKey, out List<object>? packages))
        {
            packages = await _context.OrganisationPackages
                .AsNoTracking()
                .Where(op => op.OrganisationId == org.OrganisationId)
                .Join(_context.Packages.AsNoTracking(),
                      op => op.PackageId,
                      p => p.PackageId,
                      (op, p) => new { p.PackageId, p.PackageName, p.PackageDescription })
                .OrderBy(p => p.PackageName)
                .Select(p => new {
                    packageId = p.PackageId,
                    packageName = p.PackageName,
                    packageDescription = p.PackageDescription
                })
                .ToListAsync<object>();

            // Cache for 10 minutes by default; invalidate on package/module changes
            _cache.Set(pkgCacheKey, packages, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
            });
            _keyStore.AddKey(pkgCacheKey);
        }

        return Ok(packages);
    }

    // POST: api/UserAccess/modules
    // Body: { email, firstName?, lastName?, externalId? }
    // Returns only modules allowed for the user's org, plus the packageIds each module belongs to.
    [HttpPost("modules")]
    public async Task<ActionResult<IEnumerable<object>>> GetAllowedModules([FromBody] AuthUserDto authUser)
    {
        if (authUser == null || string.IsNullOrWhiteSpace(authUser.Email))
            return BadRequest("Email is required.");

        var domain = authUser.Email.Split('@').Last().Trim().ToLower();

        // Find organisation id by domain first (fast, indexed lookup)
        var organisation = await _context.Organisations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Domain.ToLower() == domain);

        if (organisation == null)
            return Ok(new List<object>()); // unknown org → no modules

        // Optional: lightweight provisioning (create user record if missing).
        // Keep this small and after the organisation lookup to prevent extra eager loading.
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.UserEmail == authUser.Email);
        if (existingUser == null)
        {
            _context.Users.Add(new User
            {
                UserExternalId = authUser.ExternalId ?? string.Empty,
                UserFirstName = authUser.FirstName ?? string.Empty,
                UserLastName = authUser.LastName ?? string.Empty,
                UserEmail = authUser.Email,
                OrganisationId = organisation.OrganisationId,
                CreatedAt = DateTime.UtcNow
            });
            // await here to persist the minimal user record; it's small but required for downstream APIs
            await _context.SaveChangesAsync();
        }

        var cacheKey = $"org_modules_{organisation.OrganisationId}";
        if (_cache.TryGetValue(cacheKey, out List<object>? cachedModules) && cachedModules != null)
        {
            return Ok(cachedModules);
        }

        // Query module-package relationships and project fields server-side (no large Include graph)
        var allowedPackageIds = await _context.OrganisationPackages
            .Where(op => op.OrganisationId == organisation.OrganisationId)
            .Select(op => op.PackageId)
            .ToListAsync();

        var modulePackageRows = await _context.ModulePackages
            .Where(mp => allowedPackageIds.Contains(mp.PackageId))
            .Select(mp => new {
                moduleId = mp.Module.ModuleId,
                moduleTitle = mp.Module.ModuleTitle,
                moduleDescription = mp.Module.ModuleDescription,
                slug = mp.Module.Slug,
                coverImageUrl = mp.Module.CoverImageUrl,
                duration = mp.Module.Duration,
                lastUpdated = mp.Module.LastUpdated,
                packageId = mp.PackageId
            })
            .AsNoTracking()
            .ToListAsync();

        var moduleWithPackages = modulePackageRows
            .GroupBy(r => new { r.moduleId, r.moduleTitle, r.moduleDescription, r.slug, r.coverImageUrl, r.duration, r.lastUpdated })
            .Select(g => new {
                moduleId = g.Key.moduleId,
                moduleTitle = g.Key.moduleTitle,
                moduleDescription = g.Key.moduleDescription,
                slug = g.Key.slug,
                coverImageUrl = g.Key.coverImageUrl,
                duration = g.Key.duration,
                lastUpdated = g.Key.lastUpdated,
                packageIds = g.Select(x => x.packageId).Distinct().ToList()
            })
            .OrderBy(m => m.moduleId)
            .ToList<object>();

        // Cache for 10 minutes. Invalidate this when modules/packages change.
        _cache.Set(cacheKey, moduleWithPackages, new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
        });

        _keyStore.AddKey(cacheKey);

        return Ok(moduleWithPackages);
    }
}
