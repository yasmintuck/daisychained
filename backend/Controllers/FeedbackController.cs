using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dtos;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Authorize]
[Route("api/modules/{moduleId:int}/[controller]")]
public class FeedbackController : ControllerBase
{
    private readonly AppDbContext _context;

    public FeedbackController(AppDbContext context)
    {
        _context = context;
    }

    // POST api/modules/{moduleId}/feedback
    [HttpPost]
    public async Task<IActionResult> CreateFeedback(int moduleId, [FromBody] CreateFeedbackDto dto)
    {

        if (dto.Rating < 1 || dto.Rating > 5)
            return BadRequest("Rating must be between 1 and 5.");

        var externalId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(externalId)) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserExternalId == externalId);
        if (user == null) return NotFound("User not found.");

        var module = await _context.Modules.FindAsync(moduleId);
        if (module == null) return NotFound("Module not found.");

        var existing = await _context.Feedbacks.FirstOrDefaultAsync(f => f.UserId == user.UserId && f.ModuleId == moduleId);
        if (existing != null) return Conflict("Feedback already exists for this user and module.");

        var feedback = new Feedback
        {
            ModuleId = moduleId,
            UserId = user.UserId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.Feedbacks.Add(feedback);
        await _context.SaveChangesAsync();

        var result = new FeedbackDto
        {
            FeedbackId = feedback.FeedbackId,
            ModuleId = feedback.ModuleId,
            UserId = feedback.UserId,
            Rating = feedback.Rating,
            Comment = feedback.Comment,
            CreatedAt = feedback.CreatedAt,
            UpdatedAt = feedback.UpdatedAt,
            UserFirstName = user.UserFirstName,
            UserLastName = user.UserLastName
        };

        return CreatedAtAction(nameof(GetMyFeedback), new { moduleId = moduleId }, result);
    }

    // PUT api/modules/{moduleId}/feedback
    [HttpPut]
    public async Task<IActionResult> UpdateFeedback(int moduleId, [FromBody] UpdateFeedbackDto dto)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
            return BadRequest("Rating must be between 1 and 5.");

        var externalId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(externalId)) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserExternalId == externalId);
        if (user == null) return NotFound("User not found.");

        var feedback = await _context.Feedbacks.FirstOrDefaultAsync(f => f.UserId == user.UserId && f.ModuleId == moduleId);
        if (feedback == null) return NotFound("Feedback not found.");

        feedback.Rating = dto.Rating;
        feedback.Comment = dto.Comment;
        feedback.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET api/modules/{moduleId}/feedbacks
    [HttpGet("s")]
    public async Task<IActionResult> GetFeedbacks(int moduleId, int skip = 0, int take = 20)
    {
        var module = await _context.Modules.FindAsync(moduleId);
        if (module == null) return NotFound("Module not found.");

        var feedbacks = await _context.Feedbacks
            .AsNoTracking()
            .Where(f => f.ModuleId == moduleId)
            .OrderByDescending(f => f.CreatedAt)
            .Skip(skip)
            .Take(take)
            .Include(f => f.User)
            .Select(f => new FeedbackDto
            {
                FeedbackId = f.FeedbackId,
                ModuleId = f.ModuleId,
                UserId = f.UserId,
                Rating = f.Rating,
                Comment = f.Comment,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt,
                UserFirstName = f.User.UserFirstName,
                UserLastName = f.User.UserLastName
            })
            .ToListAsync();

        return Ok(feedbacks);
    }

    // GET api/modules/{moduleId}/feedbacks/me?externalId=...
    [HttpGet("me")]
    public async Task<IActionResult> GetMyFeedback(int moduleId, [FromQuery] string externalId)
    {
        if (string.IsNullOrEmpty(externalId)) return BadRequest("externalId is required");

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserExternalId == externalId);
        if (user == null) return NotFound("User not found.");

        var feedback = await _context.Feedbacks
            .AsNoTracking()
            .Where(f => f.ModuleId == moduleId && f.UserId == user.UserId)
            .Include(f => f.User)
            .Select(f => new FeedbackDto
            {
                FeedbackId = f.FeedbackId,
                ModuleId = f.ModuleId,
                UserId = f.UserId,
                Rating = f.Rating,
                Comment = f.Comment,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt,
                UserFirstName = f.User.UserFirstName,
                UserLastName = f.User.UserLastName
            })
            .FirstOrDefaultAsync();

        if (feedback == null) return NotFound();
        return Ok(feedback);
    }

}
