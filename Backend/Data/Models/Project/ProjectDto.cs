using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using TODOLIST.Enums;

namespace TODOLIST.Data.Models.Project
{
    public class ProjectDto
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
        public bool State { get; set; }

        public ICollection<Entities.ToDo> ToDos { get; set; } = new List<Entities.ToDo>();

        public ProjectStates ProjectState { get; set; } = ProjectStates.NotStarted;

        //[ForeignKey("CreatedByUserId")]
        public int CreatedByUserId { get; set; }

        public Entities.User CreatedByUser { get; set; } = new Entities.User();

        public ICollection<int> CollaboratorIds { get; set; } = new List<int>();

        public ICollection<Entities.User> Collaborators { get; set; } = new List<Entities.User>();
    }
}
