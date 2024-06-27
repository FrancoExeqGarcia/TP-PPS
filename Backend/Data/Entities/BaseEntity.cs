using System.ComponentModel.DataAnnotations.Schema;

namespace TODOLIST.Data.Entities
{
    public abstract class BaseEntity
    {
        public int Id { get; set; }

        public int CreatedByUserId { get; set; } = 1;

        [NotMapped]
        public User? CreatedByUser { get; set; }
    }
}
