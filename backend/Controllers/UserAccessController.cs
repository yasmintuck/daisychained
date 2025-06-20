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

    [HttpPost("sync-user")]
    public async Task<IActionResult> SyncUserAndGetModules([FromBody] AuthUserDto authUser)
    {
        if (string.IsNullOrWhiteSpace(authUser.Email))
            return BadRequest("Email is required");

        var email = authUser.Email.Trim().ToLower();
        var domain = email.Substring(email.IndexOf('@') + 1);

        // Check for organisation by domain
        var organisation = await _context.Organisations
            .Include(o => o.OrganisationPackages)
                .ThenInclude(op => op.Package)
                    .ThenInclude(p => p.ModulePackages)
                        .ThenInclude(mp => mp.Module)
            .FirstOrDefaultAsync(o => o.Domain == domain);

        if (organisation == null)
        {
            return NotFound($"No organisation found for domain '{domain}'");
        }

        // Try to find existing user
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserEmail == email);

        if (user == null)
        {
            user = new User
            {
                UserExternalId = authUser.ExternalId,
                UserFirstName = authUser.FirstName,
                UserLastName = authUser.LastName,
                UserEmail = authUser.Email,
                OrganisationId = organisation.OrganisationId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        // Gather allowed modules for the user's org
        var allowedModules = organisation.OrganisationPackages
            .SelectMany(op => op.Package.ModulePackages)
            .Select(mp => mp.Module)
            .Distinct()
            .ToList();

        return Ok(allowedModules);
    }
}
