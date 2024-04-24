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
            modelBuilder.Entity<User>().HasDiscriminator(u => u.UserType);

            modelBuilder.Entity<Programer>().HasData(
                new Programer
                {
                    Email = "ramirodicarlo2@gmail.com",
                    UserId = 1,
                    Password = "123456",
                    UserName = "rdic",
                });

            modelBuilder.Entity<Admin>().HasData(
                new Admin
                {
                    Email = "francoexequiel.garcia150@gmail.com",
                    UserId = 2,
                    Password = "123456",
                    UserName = "exegar",
                    UserType = nameof(UserRoleEnum.Admin)
                });

            modelBuilder.Entity<SuperAdmin>().HasData(
                new SuperAdmin
                {
                    Email = "superadmin@gmail.com",
                    UserId = 3,
                    Password = "123456",
                    UserName = "superadmin",
                    UserType = nameof(UserRoleEnum.SuperAdmin)
                });
            modelBuilder.Entity<Project>().HasData(
               new Project
               {
                   ProjectId = 1,
                   Name = "Project1",
                   StartDate = new DateTime(2023, 11, 29),
                   EndDate = new DateTime(2023, 11, 30),
                   Description = "Project from USA",
                   UserID = 1,
               },
               new Project
               {
                   ProjectId = 2,
                   Name = "Project2",
                   StartDate = new DateTime(2023, 11, 29),
                   EndDate = new DateTime(2023, 11, 30),
                   Description = "Project from Arg",
                   UserID=1,
               },
               new Project
               {
                   ProjectId = 3,
                   Name = "Project3",
                   StartDate = new DateTime(2023, 11, 29),
                   EndDate = new DateTime(2023, 11, 30),
                   Description = "Project from EU",
                   UserID = 1,
               });

            modelBuilder.Entity<ToDo>().HasData(
               new ToDo
               {
                   ToDoId = 1,
                   Name = "Controlers",
                   StartDate = new DateTime(2023, 11, 29),
                   EndDate = new DateTime(2023, 11, 30),
                   ProjectID = 1,
               },
               new ToDo
               {
                   ToDoId = 2,
                   Name = "Entities",
                   StartDate = new DateTime(2023, 11, 29),
                   EndDate = new DateTime(2023, 11, 30),
                   ProjectID = 2,
               },
               new ToDo
               {
                   ToDoId = 3,
                   Name = "Services",
                   StartDate = new DateTime(2023, 11, 29),
                   EndDate = new DateTime(2023, 11, 30),
                   ProjectID = 3,
               });

            //relación uno (project) a muchos (todo)
            modelBuilder.Entity<Project>()
                .HasMany(pj => pj.ToDos);
            //relación uno (programer) a muchos (project)
            modelBuilder.Entity<User>()
                .HasMany(pr => pr.Project);


        }
    }
}

