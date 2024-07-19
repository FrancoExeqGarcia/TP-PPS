using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TODOLIST.Migrations
{
    /// <inheritdoc />
    public partial class addProjectStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProjectState",
                table: "Project",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProjectState",
                table: "Project");
        }
    }
}
