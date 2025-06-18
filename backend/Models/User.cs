namespace backend.Models;

public class User
{
    public int UserId { get; set; } // Auto-incrementing PK
    public string UserExternalId { get; set; }
    public string UserFirstName { get; set; }
    public string UserLastName { get; set; }
    public string UserEmail { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserProgress> ProgressRecords { get; set; } = new List<UserProgress>();
}
