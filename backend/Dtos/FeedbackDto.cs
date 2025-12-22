namespace backend.Dtos;

public class FeedbackDto
{
    public int FeedbackId { get; set; }
    public int ModuleId { get; set; }
    public int UserId { get; set; }
    public byte Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UserFirstName { get; set; }
    public string? UserLastName { get; set; }
}
