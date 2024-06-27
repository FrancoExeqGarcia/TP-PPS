using TODOLIST.Data.Entities;
using TODOLIST.Enums;
using Microsoft.EntityFrameworkCore;

namespace TODOLIST.DBContext
{
    public class ToDoContext : DbContext 
    { 
        public DbSet<User>? Users { get; set; }
        public DbSet<ToDo>? ToDo { get; set; }
        public DbSet<Project>? Project { get; set; }
        public ToDoContext(DbContextOptions<ToDoContext> dbContextOptions) : base(dbContextOptions)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Existing User configuration
            modelBuilder.Entity<User>()
                .Property(e => e.Email).HasColumnType("nvarchar(100)");

            modelBuilder.Entity<User>().HasKey(e => e.Id);

            modelBuilder.Entity<User>().Property(e => e.Email)
                .HasMaxLength(50)
                .IsRequired();

            modelBuilder.Entity<User>().Property(e => e.Password)
                .HasMaxLength(50)
                .IsRequired();

            modelBuilder.Entity<User>().Property(e => e.State)
                .IsRequired();

            modelBuilder.Entity<User>().Property(e => e.UserType)
                .HasConversion(
                    v => v.ToString(),
                    v => (UserRoleEnum)Enum.Parse(typeof(UserRoleEnum), v));

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Email = "ramirodicarlo2@gmail.com",
                    Password = "123456",
                    Name = "Ramiro Dicarlo",
                    UserType = UserRoleEnum.Admin
                },
                new User
                {
                    Id = 2,
                    Email = "francoexequiel.garcia150@gmail.com",
                    Password = "123456",
                    Name = "Franco Garcia",
                    UserType = UserRoleEnum.SuperAdmin
                });

            // ToDo configuration
            modelBuilder.Entity<ToDo>()
                .HasOne(t => t.Project)
                .WithMany(p => p.ToDos)
                .HasForeignKey(t => t.ProjectID)
                .OnDelete(DeleteBehavior.Restrict);

            // ToDo configuration
            modelBuilder.Entity<ToDo>()
                .HasOne(t => t.AssignedUser)
                .WithMany(p => p.ToDosAssigned)
                .HasForeignKey(t => t.AssignedUserId)
                .OnDelete(DeleteBehavior.SetNull);

            // Project configuration
            modelBuilder.Entity<Project>()
                .HasMany(p => p.ToDos)
                .WithOne(t => t.Project)
                .HasForeignKey(t => t.ProjectID);

            // User - Project relationship configuration
            modelBuilder.Entity<User>()
                .HasMany(u => u.ProjectAssigned)
                .WithOne(t => t.CreatedByUser)
                .HasForeignKey(p => p.CreatedByUserId);

        }
    }
}



