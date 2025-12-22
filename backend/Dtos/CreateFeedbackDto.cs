namespace backend.Dtos;

public class CreateFeedbackDto
{
    // Rating 1-5
    public byte Rating { get; set; }
    public string? Comment { get; set; }
}
