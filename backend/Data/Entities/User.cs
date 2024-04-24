using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using TODOLIST.Enums;

namespace TODOLIST.Data.Entities
{
    public abstract class User
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserId { get; set; }
        public string Email { get; set; } = "";
        public string UserName { get; set; } = "";
        public string Password { get; set; } = "";
        [Required]
        public string UserType { get; set; } = nameof(UserRoleEnum.Programer);
        public bool State { get; set; } = true;
        public ICollection<Project> Project { get; set; } = new List<Project>();
    }
}