using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> User { get; set; }
    public DbSet<Module> Modules { get; set; }
    public DbSet<UserProgress> UserProgressRecords { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserProgress>()
            .HasOne(up => up.User)
            .WithMany(u => u.ProgressRecords)
            .HasForeignKey(up => up.UserId);

        modelBuilder.Entity<UserProgress>()
            .HasOne(up => up.Module)
            .WithMany(m => m.UserProgressRecords)
            .HasForeignKey(up => up.ModuleId);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.UserExternalId)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.UserEmail)
            .IsUnique();
    }
}

}