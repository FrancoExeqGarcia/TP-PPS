using TODOLIST.Enums;

namespace TODOLIST.Data.Models.User
{
    public class UpdateUserRequest
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool State { get; set; } = true;
        public string UserType { get; set; } = UserRoleEnum.Programmer.ToString();

    }
   
}
