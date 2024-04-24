﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using TODOLIST.DBContext;

#nullable disable

namespace TODOLIST.Migrations
{
    [DbContext(typeof(ToDoContext))]
    [Migration("20231201195239_InitalMigration")]
    partial class InitalMigration
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "6.0.0");

            modelBuilder.Entity("TODOLIST.Data.Entities.Project", b =>
                {
                    b.Property<int>("ProjectId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int?>("AdminUserId")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("EndDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("StartDate")
                        .HasColumnType("TEXT");

                    b.Property<bool>("State")
                        .HasColumnType("INTEGER");

                    b.Property<int>("UserID")
                        .HasColumnType("INTEGER");

                    b.HasKey("ProjectId");

                    b.HasIndex("AdminUserId");

                    b.HasIndex("UserID");

                    b.ToTable("Project");

                    b.HasData(
                        new
                        {
                            ProjectId = 1,
                            Description = "Project from USA",
                            EndDate = new DateTime(2023, 11, 30, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            Name = "Project1",
                            StartDate = new DateTime(2023, 11, 29, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            State = true,
                            UserID = 1
                        },
                        new
                        {
                            ProjectId = 2,
                            Description = "Project from Arg",
                            EndDate = new DateTime(2023, 11, 30, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            Name = "Project2",
                            StartDate = new DateTime(2023, 11, 29, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            State = true,
                            UserID = 1
                        },
                        new
                        {
                            ProjectId = 3,
                            Description = "Project from EU",
                            EndDate = new DateTime(2023, 11, 30, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            Name = "Project3",
                            StartDate = new DateTime(2023, 11, 29, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            State = true,
                            UserID = 1
                        });
                });

            modelBuilder.Entity("TODOLIST.Data.Entities.ToDo", b =>
                {
                    b.Property<int>("ToDoId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<DateTime>("EndDate")
                        .HasColumnType("TEXT");

                    b.Property<bool>("IsCompleted")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<int>("ProjectID")
                        .HasColumnType("INTEGER");

                    b.Property<DateTime>("StartDate")
                        .HasColumnType("TEXT");

                    b.Property<bool>("State")
                        .HasColumnType("INTEGER");

                    b.HasKey("ToDoId");

                    b.HasIndex("ProjectID");

                    b.ToTable("ToDo");

                    b.HasData(
                        new
                        {
                            ToDoId = 1,
                            EndDate = new DateTime(2023, 11, 30, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            IsCompleted = false,
                            Name = "Controlers",
                            ProjectID = 1,
                            StartDate = new DateTime(2023, 11, 29, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            State = true
                        },
                        new
                        {
                            ToDoId = 2,
                            EndDate = new DateTime(2023, 11, 30, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            IsCompleted = false,
                            Name = "Entities",
                            ProjectID = 2,
                            StartDate = new DateTime(2023, 11, 29, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            State = true
                        },
                        new
                        {
                            ToDoId = 3,
                            EndDate = new DateTime(2023, 11, 30, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            IsCompleted = false,
                            Name = "Services",
                            ProjectID = 3,
                            StartDate = new DateTime(2023, 11, 29, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            State = true
                        });
                });

            modelBuilder.Entity("TODOLIST.Data.Entities.User", b =>
                {
                    b.Property<int>("UserId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("Password")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<bool>("State")
                        .HasColumnType("INTEGER");

                    b.Property<string>("UserName")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("UserType")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("UserId");

                    b.ToTable("Users");

                    b.HasDiscriminator<string>("UserType").HasValue("User");
                });

            modelBuilder.Entity("TODOLIST.Data.Entities.Admin", b =>
                {
                    b.HasBaseType("TODOLIST.Data.Entities.User");

                    b.HasDiscriminator().HasValue("Admin");

                    b.HasData(
                        new
                        {
                            UserId = 2,
                            Email = "francoexequiel.garcia150@gmail.com",
                            Password = "123456",
                            State = true,
                            UserName = "exegar",
                            UserType = "Admin"
                        });
                });

            modelBuilder.Entity("TODOLIST.Data.Entities.Programer", b =>
                {
                    b.HasBaseType("TODOLIST.Data.Entities.User");

                    b.HasDiscriminator().HasValue("Programer");

                    b.HasData(
                        new
                        {
                            UserId = 1,
                            Email = "ramirodicarlo2@gmail.com",
                            Password = "123456",
                            State = true,
                            UserName = "rdic",
                            UserType = "Programer"
                        });
                });

            modelBuilder.Entity("TODOLIST.Data.Entities.SuperAdmin", b =>
                {
                    b.HasBaseType("TODOLIST.Data.Entities.User");

                    b.HasDiscriminator().HasValue("SuperAdmin");

                    b.HasData(
                        new
                        {
                            UserId = 3,
                            Email = "superadmin@gmail.com",
                            Password = "123456",
                            State = true,
                            UserName = "superadmin",
                            UserType = "SuperAdmin"
                        });
                });

            modelBuilder.Entity("TODOLIST.Data.Entities.Project", b =>
                {
                    b.HasOne("TODOLIST.Data.Entities.Admin", null)
                        .WithMany("Projects")
                        .HasForeignKey("AdminUserId");

                    b.HasOne("TODOLIST.Data.Entities.User", null)
                        .WithMany("Project")
                        .HasForeignKey("UserID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("TODOLIST.Data.Entities.ToDo", b =>
                {
                    b.HasOne("TODOLIST.Data.Entities.Project", null)
                        .WithMany("ToDos")
                        .HasForeignKey("ProjectID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("TODOLIST.Data.Entities.Project", b =>
                {
                    b.Navigation("ToDos");
                });

            modelBuilder.Entity("TODOLIST.Data.Entities.User", b =>
                {
                    b.Navigation("Project");
                });

            modelBuilder.Entity("TODOLIST.Data.Entities.Admin", b =>
                {
                    b.Navigation("Projects");
                });
#pragma warning restore 612, 618
        }
    }
}
