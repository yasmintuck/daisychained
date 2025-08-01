﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using backend.Data;

#nullable disable

namespace backend.Migrations
{
    [DbContext(typeof(AppDbContext))]
    partial class AppDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.6")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("backend.Models.Module", b =>
                {
                    b.Property<int>("ModuleId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("ModuleId"));

                    b.Property<string>("CoverImageUrl")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Duration")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("LastUpdated")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("ModuleDescription")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ModuleTitle")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Slug")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("ModuleId");

                    b.ToTable("Modules");
                });

            modelBuilder.Entity("backend.Models.ModulePackage", b =>
                {
                    b.Property<int>("ModuleId")
                        .HasColumnType("integer");

                    b.Property<int>("PackageId")
                        .HasColumnType("integer");

                    b.HasKey("ModuleId", "PackageId");

                    b.HasIndex("PackageId");

                    b.ToTable("ModulePackages");
                });

            modelBuilder.Entity("backend.Models.Organisation", b =>
                {
                    b.Property<int>("OrganisationId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("OrganisationId"));

                    b.Property<string>("Domain")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("OrganisationName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("OrganisationId");

                    b.HasIndex("Domain")
                        .IsUnique();

                    b.ToTable("Organisations");
                });

            modelBuilder.Entity("backend.Models.OrganisationPackage", b =>
                {
                    b.Property<int>("OrganisationId")
                        .HasColumnType("integer");

                    b.Property<int>("PackageId")
                        .HasColumnType("integer");

                    b.HasKey("OrganisationId", "PackageId");

                    b.HasIndex("PackageId");

                    b.ToTable("OrganisationPackages");
                });

            modelBuilder.Entity("backend.Models.Package", b =>
                {
                    b.Property<int>("PackageId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("PackageId"));

                    b.Property<string>("PackageDescription")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PackageName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("PackageId");

                    b.ToTable("Packages");
                });

            modelBuilder.Entity("backend.Models.User", b =>
                {
                    b.Property<int>("UserId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("UserId"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int?>("OrganisationId")
                        .HasColumnType("integer");

                    b.Property<string>("UserEmail")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("UserExternalId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("UserFirstName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("UserLastName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("UserId");

                    b.HasIndex("OrganisationId");

                    b.HasIndex("UserEmail")
                        .IsUnique();

                    b.HasIndex("UserExternalId")
                        .IsUnique();

                    b.ToTable("User");
                });

            modelBuilder.Entity("backend.Models.UserProgress", b =>
                {
                    b.Property<int>("UserProgressId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("UserProgressId"));

                    b.Property<DateTime>("LastAccessed")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("ModuleId")
                        .HasColumnType("integer");

                    b.Property<int>("Progress")
                        .HasColumnType("integer");

                    b.Property<int>("UserId")
                        .HasColumnType("integer");

                    b.HasKey("UserProgressId");

                    b.HasIndex("ModuleId");

                    b.HasIndex("UserId");

                    b.ToTable("UserProgressRecords");
                });

            modelBuilder.Entity("backend.Models.ModulePackage", b =>
                {
                    b.HasOne("backend.Models.Module", "Module")
                        .WithMany()
                        .HasForeignKey("ModuleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("backend.Models.Package", "Package")
                        .WithMany("ModulePackages")
                        .HasForeignKey("PackageId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Module");

                    b.Navigation("Package");
                });

            modelBuilder.Entity("backend.Models.OrganisationPackage", b =>
                {
                    b.HasOne("backend.Models.Organisation", "Organisation")
                        .WithMany("OrganisationPackages")
                        .HasForeignKey("OrganisationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("backend.Models.Package", "Package")
                        .WithMany("OrganisationPackages")
                        .HasForeignKey("PackageId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Organisation");

                    b.Navigation("Package");
                });

            modelBuilder.Entity("backend.Models.User", b =>
                {
                    b.HasOne("backend.Models.Organisation", "Organisation")
                        .WithMany("Users")
                        .HasForeignKey("OrganisationId");

                    b.Navigation("Organisation");
                });

            modelBuilder.Entity("backend.Models.UserProgress", b =>
                {
                    b.HasOne("backend.Models.Module", "Module")
                        .WithMany("UserProgressRecords")
                        .HasForeignKey("ModuleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("backend.Models.User", "User")
                        .WithMany("ProgressRecords")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Module");

                    b.Navigation("User");
                });

            modelBuilder.Entity("backend.Models.Module", b =>
                {
                    b.Navigation("UserProgressRecords");
                });

            modelBuilder.Entity("backend.Models.Organisation", b =>
                {
                    b.Navigation("OrganisationPackages");

                    b.Navigation("Users");
                });

            modelBuilder.Entity("backend.Models.Package", b =>
                {
                    b.Navigation("ModulePackages");

                    b.Navigation("OrganisationPackages");
                });

            modelBuilder.Entity("backend.Models.User", b =>
                {
                    b.Navigation("ProgressRecords");
                });
#pragma warning restore 612, 618
        }
    }
}
