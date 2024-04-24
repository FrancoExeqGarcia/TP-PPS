using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TODOLIST.Data.Entities
{
    public class Project
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required]
        public int ProjectId { get; set; }
        public string? Name { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Description { get; set; }
        public bool State { get; set; } = true;
        public ICollection<ToDo> ToDos { get; set; } = new List<ToDo>();
        [ForeignKey("UserID")]
        public  int UserID { get; set; }

    }
}
