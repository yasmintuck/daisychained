using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Dtos;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserProgressController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserProgressController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> UpdateProgress([FromBody] UserProgressUpdateDto dto)
        {
            // Find the user based on their external Auth0 ID
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserExternalId == dto.UserExternalId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Find the module by ID
            var module = await _context.Modules.FindAsync(dto.ModuleId);
            if (module == null)
            {
                return NotFound("Module not found.");
            }

            // Check if a progress record already exists
            var existingProgress = await _context.UserProgressRecords
                .FirstOrDefaultAsync(p => p.UserId == user.UserId && p.ModuleId == module.ModuleId);

            if (existingProgress != null)
            {
                existingProgress.Progress = dto.Progress;
                existingProgress.LastAccessed = DateTime.UtcNow;
            }
            else
            {
                _context.UserProgressRecords.Add(new UserProgress
                {
                    UserId = user.UserId,
                    ModuleId = module.ModuleId,
                    Progress = dto.Progress,
                    LastAccessed = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
