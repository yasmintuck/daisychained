namespace backend.Dtos
{
public class UserProgressUpdateDto
{
    public int UserId { get; set; }
    public int ModuleId { get; set; }
    public int Progress { get; set; } // 0 = not started, 1 = in progress, 2 = completed
}
}
