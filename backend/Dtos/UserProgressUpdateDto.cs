namespace backend.Dtos
{
public class UserProgressUpdateDto
{
        public string UserEmail { get; set; }      // still needed to identify user
        public string Slug { get; set; }           // new: links to Module.Slug
        public int Progress { get; set; }          // 0 = not started, 1 = in progress, 2 = completed
}
}
