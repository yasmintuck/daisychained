namespace backend.Models;

public class UserProgress
{
    public int UserProgressId { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    public int ModuleId { get; set; }
    public Module Module { get; set; }

    public int Progress { get; set; }
    public DateTime LastAccessed { get; set; } = DateTime.UtcNow;
}
