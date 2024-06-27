using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TODOLIST.Data.Entities
{
    public class Project : BaseEntity
    {
        public string Name { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string? Description { get; set; }

        public bool State { get; set; } = true;

        public ICollection<ToDo> ToDos { get; set; } = new List<ToDo>();

        [NotMapped]
        public ICollection<User> Collaborators { get; set; } = new List<User>();
        //public ICollection<int> CollaboratorIds 
        //    => Collaborators?.Select(e => e.Id).ToList() ?? new List<int>();
    }
}
