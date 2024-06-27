using System.ComponentModel.DataAnnotations;

namespace TODOLIST.Data.Models.ToDo
{
    public class UpdateToDoRequest
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
        public bool State { get; set; } = true;

        [Required]
        public bool IsCompleted { get; set; } = false;

        public int? AssignedUserId { get; set; }
    }
}
