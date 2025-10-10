using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddBadgeFieldsAndCompletedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "UserProgressRecords",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BadgeImageUrl",
                table: "Modules",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CertificateTemplateUrl",
                table: "Modules",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "UserProgressRecords");

            migrationBuilder.DropColumn(
                name: "BadgeImageUrl",
                table: "Modules");

            migrationBuilder.DropColumn(
                name: "CertificateTemplateUrl",
                table: "Modules");
        }
    }
}
