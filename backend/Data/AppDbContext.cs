using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Module> Modules { get; set; }
    public DbSet<UserProgress> UserProgressRecords { get; set; }
    public DbSet<Feedback> Feedbacks { get; set; }
    public DbSet<Package> Packages { get; set; }
    public DbSet<ModulePackage> ModulePackages { get; set; }
    public DbSet<Organisation> Organisations { get; set; }
    public DbSet<OrganisationPackage> OrganisationPackages { get; set; }
    public DbSet<BlogPost> BlogPosts { get; set; }


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

            modelBuilder.Entity<ModulePackage>()
                .HasKey(mp => new { mp.ModuleId, mp.PackageId });

            modelBuilder.Entity<OrganisationPackage>()
                .HasKey(op => new { op.OrganisationId, op.PackageId });

            modelBuilder.Entity<Organisation>()
                .HasIndex(o => o.Domain)
                .IsUnique();
                
            modelBuilder.Entity<BlogPost>()
                .HasIndex(b => b.Slug)
                .IsUnique();

        // Feedback entity configuration
        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(f => f.FeedbackId);

            entity.HasIndex(f => new { f.UserId, f.ModuleId }).IsUnique();
            entity.HasIndex(f => f.ModuleId);
            entity.HasIndex(f => f.UserId);

            entity.HasOne(f => f.User)
                .WithMany(u => u.Feedbacks)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(f => f.Module)
                .WithMany(m => m.Feedbacks)
                .HasForeignKey(f => f.ModuleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(f => f.Comment).HasMaxLength(2000);

                // Configure table and add check constraint for rating
                entity.ToTable("Feedback", t => t.HasCheckConstraint("CK_Feedback_Rating", "[Rating] >= 1 AND [Rating] <= 5"));
        });

            modelBuilder.Entity<BlogPost>()
                .Property(b => b.Title)
                .HasMaxLength(200);

            modelBuilder.Entity<BlogPost>()
                .Property(b => b.Slug)
                .HasMaxLength(200);

        }
}

}