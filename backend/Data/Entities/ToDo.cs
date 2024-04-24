using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace TODOLIST.Data.Entities
{
    public class ToDo
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required]
        public int ToDoId { get; set; }
        public string? Name { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        [ForeignKey("ProjectID")]
        public int ProjectID { get; set; }
       // public Project Project { get; set; }
        
        public bool State { get; set; } = true;
        public bool IsCompleted { get; set; } = false;
    }
}
