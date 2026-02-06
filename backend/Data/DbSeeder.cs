using backend.models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public static class DbSeeder
    {
        public static async Task SeedDefaultAdmin(GymDbContext context)
        {
            // Check if any admin exists
            if (await context.Admins.AnyAsync())
            {
                return; // Admin already exists, no need to seed
            }

            // Create default admin
            var defaultAdmin = new Admin
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"), // Default password
                CreatedAt = DateTime.UtcNow
            };

            context.Admins.Add(defaultAdmin);
            await context.SaveChangesAsync();

            Console.WriteLine("========================================");
            Console.WriteLine("DEFAULT ADMIN CREATED:");
            Console.WriteLine("Username: admin");
            Console.WriteLine("Password: Admin@123");
            Console.WriteLine("PLEASE CHANGE THIS PASSWORD IMMEDIATELY!");
            Console.WriteLine("========================================");
        }
    }
}
