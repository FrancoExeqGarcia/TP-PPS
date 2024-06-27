using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace TODOLIST.Data.Entities
{
    public class ToDo : BaseEntity
    {
        public string Name { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public int ProjectID { get; set; }
        public Project Project { get; set; } // Keep this as is, as it will be properly handled by EF

        public bool State { get; set; } = true;

        public bool IsCompleted { get; set; } = false;

        public int? AssignedUserId { get; set; }

        public User? AssignedUser { get; set; }
    }
}
