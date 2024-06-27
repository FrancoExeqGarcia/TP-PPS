using System.ComponentModel.DataAnnotations;

namespace TODOLIST.Data.Models.ToDo
{
    public class CreateToDoRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public int ProjectID { get; set; }

        [Required]
        public bool State { get; set; } = true;

        [Required]
        public bool IsCompleted { get; set; } = false;

        public int? AssignedUserId { get; set; }

        public int CreatedByUserId { get; set; } = 1;

    }
}
