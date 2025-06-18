namespace backend.Models;

public class Module
{
    public int ModuleId { get; set; }
    public string ModuleTitle { get; set; }
    public string ModuleDescription { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserProgress> UserProgressRecords { get; set; } = new List<UserProgress>();
}
