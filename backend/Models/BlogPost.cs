namespace backend.Models
{
    public class BlogPost
    {
        public int BlogPostId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;             // unique
        public string? Excerpt { get; set; }                          // short summary for cards
        public string Content { get; set; } = string.Empty;           // markdown or HTML
        public string? CoverImageUrl { get; set; }
        public string? Author { get; set; }
        public string? Tags { get; set; }                             // comma-separated, e.g. "ai, pedagogy"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PublishedAt { get; set; }                    // null = draft
    }
}
