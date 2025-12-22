using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Feedback")]
public class Feedback
{
    public int FeedbackId { get; set; }

    [Required]
    public int ModuleId { get; set; }
    public Module Module { get; set; }

    [Required]
    public int UserId { get; set; }
    public User User { get; set; }

    [Required]
    [Range(1, 5)]
    public byte Rating { get; set; }

    [MaxLength(2000)]
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
