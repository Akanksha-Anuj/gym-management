using Microsoft.EntityFrameworkCore;
using backend.models;

namespace backend.Data
{
    public class GymDbContext : DbContext
    {
        public GymDbContext(DbContextOptions<GymDbContext> options) : base(options)
        {
        }

        public DbSet<members> Members { get; set; }
        public DbSet<Admin> Admins { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<members>(entity =>
            {
                entity.HasKey(e => e.id);
                entity.Property(e => e.subscriptionPlan).IsRequired();
                entity.Property(e => e.name).IsRequired();
                entity.Property(e => e.address).IsRequired();
            });

            modelBuilder.Entity<Admin>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.HasIndex(e => e.Username).IsUnique();
            });
        }
    }
}
