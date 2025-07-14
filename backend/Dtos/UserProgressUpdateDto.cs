namespace backend.Dtos
{
public class UserProgressUpdateDto
{
    public string UserExternalId { get; set; }
    public int ModuleId { get; set; }
    public int Progress { get; set; }
}
}
