using ErrorOr;
using System.Collections.Generic;
using System.Threading.Tasks;
using TODOLIST.Data.Entities;
using TODOLIST.Data.Models;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace TODOLIST.Services.Interfaces
{
    public interface IUserService
    {
        bool CheckIfUserExists(string userEmail);
        BaseResponse ValidateUser(string email, string password);
        User CreateUser(User user);
        bool DeleteUser(int userId);
        List<User> GetAllUsers();
        User? GetUserById(int userId);
        User? GetUserByEmail(string email);
        User? UpdateUser(int userId, User updateUser);

    }
}
