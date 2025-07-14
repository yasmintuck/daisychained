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
            var user = await _context.Users.FindAsync(dto.UserId);
            var module = await _context.Modules.FindAsync(dto.ModuleId);

            if (user == null || module == null)
                return NotFound("User or module not found");

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
