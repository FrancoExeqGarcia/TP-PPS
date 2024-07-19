using System.ComponentModel.DataAnnotations;
using TODOLIST.Enums;

namespace TODOLIST.Data.Models.Project
{
    public class CreateProjectRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public string? Description { get; set; }

        public ProjectStates ProjectState { get; set; } = ProjectStates.NotStarted;

        [Required]
        public bool State { get; set; } = true;

        public ICollection<int> CollaboratorIds { get; set; } = new List<int>();
    }
}
