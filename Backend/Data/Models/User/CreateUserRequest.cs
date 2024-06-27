using TODOLIST.Enums;

namespace TODOLIST.Data.Models.User
{
    public class CreateUserRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool State { get; set; } = true;

        public string Email { get; set; } = string.Empty;

        public string UserType { get; set; } = UserRoleEnum.Programmer.ToString();
    }
}
