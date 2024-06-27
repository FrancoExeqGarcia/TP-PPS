namespace TODOLIST.Data.Models.User
{
    public class UserDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string UserType { get; set; } = string.Empty;

        public bool State { get; set; } = true;

        public ICollection<Entities.Project> ProjectAssigned { get; set; } = new List<Entities.Project>();

        public ICollection<Entities.ToDo> ToDosAssigned { get; set; } = new List<Entities.ToDo>();

        public int CreatedByUserId { get; set; }
    }
}
