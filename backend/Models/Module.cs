namespace backend.Models;

public class Module
{
    public int ModuleId { get; set; }
    public string ModuleTitle { get; set; }
    public string ModuleDescription { get; set; }
    public string Slug { get; set; }
    public string CoverImageUrl { get; set; }
    public string Duration { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastUpdated { get; set; }
    public string? BadgeImageUrl { get; set; }           
    public string? CertificateTemplateUrl { get; set; }  


    public ICollection<UserProgress> UserProgressRecords { get; set; } = new List<UserProgress>();
}
