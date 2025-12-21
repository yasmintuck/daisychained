using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ModulesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ModulesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetModules()
        {
            // Return a lightweight projection and avoid tracking for faster, safer JSON serialization
            var modules = await _context.Modules
                .AsNoTracking()
                .Select(m => new {
                    moduleId = m.ModuleId,
                    moduleTitle = m.ModuleTitle,
                    moduleDescription = m.ModuleDescription,
                    slug = m.Slug,
                    coverImageUrl = m.CoverImageUrl,
                    duration = m.Duration,
                    lastUpdated = m.LastUpdated,
                    badgeImageUrl = m.BadgeImageUrl,
                    certificateTemplateUrl = m.CertificateTemplateUrl
                })
                .OrderBy(m => m.moduleId)
                .ToListAsync();

            return Ok(modules);
        }
    }
}
