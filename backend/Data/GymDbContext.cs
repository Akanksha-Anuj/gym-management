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
        public DbSet<Visitor> Visitors { get; set; }
        public DbSet<PTClient> PTClients { get; set; }
        public DbSet<Expense> Expenses { get; set; }

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

            modelBuilder.Entity<Visitor>(entity =>
            {
                entity.HasKey(e => e.id);
                entity.Property(e => e.name).IsRequired();
                entity.Property(e => e.contactNumber).IsRequired();
                entity.Property(e => e.address).IsRequired();
            });

            modelBuilder.Entity<PTClient>(entity =>
            {
                entity.HasKey(e => e.id);
                entity.Property(e => e.name).IsRequired();
                entity.Property(e => e.contactNumber).IsRequired();
                entity.Property(e => e.address).IsRequired();
                entity.Property(e => e.payment).HasColumnType("decimal(18,2)");
                entity.Property(e => e.paid).HasColumnType("decimal(18,2)");
                entity.Property(e => e.due).HasColumnType("decimal(18,2)");
                entity.Property(e => e.ptStartDate).IsRequired();
                entity.Property(e => e.ptEndDate).IsRequired();
                entity.Property(e => e.trainer).IsRequired();
            });

            modelBuilder.Entity<Expense>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ExpenseDate).IsRequired();
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.ExpenseType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Remarks).HasMaxLength(500);
            });
        }
    }
}
