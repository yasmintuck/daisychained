using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BlogController : ControllerBase
    {
        private readonly AppDbContext _context;
        public BlogController(AppDbContext context) => _context = context;

        // GET: /api/blog?publishedOnly=true
        [HttpGet]
        public async Task<IActionResult> GetPosts([FromQuery] bool publishedOnly = true)
        {
            var query = _context.BlogPosts.AsQueryable();

            if (publishedOnly)
                query = query.Where(p => p.PublishedAt != null);

            var posts = await query
                .OrderByDescending(p => p.PublishedAt ?? p.CreatedAt)
                .Select(p => new {
                    p.BlogPostId,
                    p.Title,
                    p.Slug,
                    p.Excerpt,
                    p.CoverImageUrl,
                    p.Author,
                    p.Tags,
                    PublishedAt = p.PublishedAt ?? p.CreatedAt
                })
                .ToListAsync();

            return Ok(posts);
        }

        // GET: /api/blog/{slug}
        [HttpGet("{slug}")]
        public async Task<IActionResult> GetPostBySlug(string slug)
        {
            var post = await _context.BlogPosts
                .FirstOrDefaultAsync(p => p.Slug == slug);

            if (post == null) return NotFound();

            return Ok(new {
                post.BlogPostId,
                post.Title,
                post.Slug,
                post.Excerpt,
                post.Content,
                post.CoverImageUrl,
                post.Author,
                post.Tags,
                post.CreatedAt,
                post.UpdatedAt,
                post.PublishedAt
            });
        }
    }
}
