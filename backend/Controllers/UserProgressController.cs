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
            // Check if the user and module exist using their IDs
            var userExists = await _context.Users.AnyAsync(u => u.UserId == dto.UserId);
            var moduleExists = await _context.Modules.AnyAsync(m => m.ModuleId == dto.ModuleId);

            if (!userExists || !moduleExists)
                return NotFound("User or module not found");

            // Check if a progress record already exists
            var existingProgress = await _context.UserProgressRecords
                .FirstOrDefaultAsync(p => p.UserId == dto.UserId && p.ModuleId == dto.ModuleId);

            if (existingProgress != null)
            {
                existingProgress.Progress = dto.Progress;
                existingProgress.LastAccessed = DateTime.UtcNow;
            }
            else
            {
                _context.UserProgressRecords.Add(new UserProgress
                {
                    UserId = dto.UserId,
                    ModuleId = dto.ModuleId,
                    Progress = dto.Progress,
                    LastAccessed = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
