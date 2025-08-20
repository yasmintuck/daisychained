using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Dtos;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserAccessController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserAccessController(AppDbContext context)
    {
        _context = context;
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

        var organisation = await _context.Organisations
            .Include(o => o.OrganisationPackages)
                .ThenInclude(op => op.Package)
            .FirstOrDefaultAsync(o => o.Domain.ToLower() == domain);

        if (organisation == null)
            return Ok(new List<object>()); // unknown org → no packages

        var packages = organisation.OrganisationPackages
            .Select(op => new
            {
                packageId = op.Package.PackageId,
                packageName = op.Package.PackageName,
                packageDescription = op.Package.PackageDescription
            })
            .OrderBy(p => p.packageName)
            .ToList();

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

        // Find org by domain
        var organisation = await _context.Organisations
            .Include(o => o.OrganisationPackages)
                .ThenInclude(op => op.Package)
                    .ThenInclude(p => p.ModulePackages)
                        .ThenInclude(mp => mp.Module)
            .FirstOrDefaultAsync(o => o.Domain.ToLower() == domain);

        if (organisation == null)
            return Ok(new List<object>()); // unknown org → no modules

        // Optional: ensure user record exists (lightweight “provisioning”)
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
            await _context.SaveChangesAsync();
        }

        // Collect modules + which packageIds they belong to (but only packages the org can see)
        var allowedPackageIds = organisation.OrganisationPackages.Select(op => op.PackageId).ToHashSet();

        var moduleWithPackages = organisation.OrganisationPackages
            .SelectMany(op => op.Package.ModulePackages)
            .Where(mp => allowedPackageIds.Contains(mp.PackageId))
            .GroupBy(mp => mp.Module)
            .Select(g => new
            {
                moduleId = g.Key.ModuleId,
                moduleTitle = g.Key.ModuleTitle,
                moduleDescription = g.Key.ModuleDescription,
                slug = g.Key.Slug,
                coverImageUrl = g.Key.CoverImageUrl,
                duration = g.Key.Duration,
                lastUpdated = g.Key.LastUpdated,
                packageIds = g.Select(x => x.PackageId).Distinct().ToList()
            })
            .OrderBy(m => m.moduleId)
            .ToList();

        return Ok(moduleWithPackages);
    }
}
