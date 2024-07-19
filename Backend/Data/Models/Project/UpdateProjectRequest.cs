using System.ComponentModel.DataAnnotations;

namespace TODOLIST.Data.Models.Project
{
    public class UpdateProjectRequest
    {
        [Required]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public string? Description { get; set; }

        [Required]
        public int State { get; set; }

        public ICollection<int> CollaboratorIds { get; set; } = new List<int>();
    }
}
