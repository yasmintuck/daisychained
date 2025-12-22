using System.ComponentModel.DataAnnotations.Schema;
namespace backend.Models;

[Table("User")]
public class User
{
    public int UserId { get; set; } // Auto-incrementing PK
    public string UserExternalId { get; set; }
    public string UserFirstName { get; set; }
    public string UserLastName { get; set; }
    public string UserEmail { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int? OrganisationId { get; set; }
    public Organisation Organisation { get; set; }

    public ICollection<UserProgress> ProgressRecords { get; set; } = new List<UserProgress>();
    
    // Feedbacks left by this user on modules
    public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
}
