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
    public DbSet<Package> Packages { get; set; }
    public DbSet<ModulePackage> ModulePackages { get; set; }
    public DbSet<Organisation> Organisations { get; set; }
    public DbSet<OrganisationPackage> OrganisationPackages { get; set; }

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
        }
}

}