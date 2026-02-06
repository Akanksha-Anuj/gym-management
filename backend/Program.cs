using Microsoft.EntityFrameworkCore;
using backend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Register Database Context
builder.Services.AddDbContext<GymDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
    // Configure PostgreSQL to use UTC timestamps
    AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
});

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// Add Controllers
builder.Services.AddControllers();

// Add CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

// Seed default admin user
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<GymDbContext>();
    await DbSeeder.SeedDefaultAdmin(context);
}

// Configure the HTTP request pipeline.
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

// Map Controllers
app.MapControllers();

// Root endpoint
app.MapGet("/", () => Results.Json(new
{
    message = "Gym Management API is running",
    version = "1.0",
    endpoints = new
    {
        login = "POST /api/auth/login",
        register = "POST /api/auth/register",
        changePassword = "POST /api/auth/change-password",
        members = "GET/POST /api/members",
        member = "GET/PUT/DELETE /api/members/{id}"
    },
    defaultAdmin = new
    {
        username = "admin",
        password = "Admin@123",
        note = "Please change this password immediately using /api/auth/change-password"
    }
}));

app.Run();
