namespace backend.Models
{
    public class UserProgress
    {
        public int UserProgressId { get; set; }

        // Foreign Key → User
        public int UserId { get; set; }
        public User User { get; set; }

        // Foreign Key → Module
        public int ModuleId { get; set; }
        public Module Module { get; set; }

        // 0 = Not Started, 1 = In Progress, 2 = Completed
        public int Progress { get; set; } = 0;

        public DateTime LastAccessed { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }  // set when Progress becomes 2 (Completed)
    }
}
