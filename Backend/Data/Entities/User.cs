using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using TODOLIST.Enums;

namespace TODOLIST.Data.Entities
{
    public class User : BaseEntity
    {
        public User()
        {

        }
        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public bool State { get; set; } = true;

        public ICollection<Project> ProjectAssigned { get; set; } = new List<Project>();

        public ICollection<ToDo> ToDosAssigned { get; set; } = new List<ToDo>();

        public UserRoleEnum UserType { get; set; } = UserRoleEnum.Programmer;
    }
}