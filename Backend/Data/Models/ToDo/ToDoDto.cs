using System.ComponentModel.DataAnnotations;

namespace TODOLIST.Data.Models.ToDo
{
    public class ToDoDto
    {
        [Required]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public int ProjectID { get; set; }
        public Entities.Project Project { get; set; } = new();

        [Required]
        public bool State { get; set; } = true;

        [Required]
        public bool IsCompleted { get; set; } = false;

        public int? AssignedUserId { get; set; }

        public Entities.User? AssignedUser { get; set; }


        public int CreatedByUserId { get; set; } = 1;

        public Entities.User CreatedByUser { get; set; } = new Entities.User();

    }
}
