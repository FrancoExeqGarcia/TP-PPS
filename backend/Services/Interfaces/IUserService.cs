using ErrorOr;
using System.Collections.Generic;
using System.Threading.Tasks;
using TODOLIST.Data.Entities;
using TODOLIST.Data.Models;
using TODOLIST.Data.Models.User;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace TODOLIST.Services.Interfaces
{
    public interface IUserService
    {
        List<UserDto> GetAll();
        UserDto GetById(int id);
        UserDto Create(CreateUserRequest request);
        UserDto Update(int id, UpdateUserRequest dto);
        void Delete(int id);

        UserDto GetByEmailAndPassword(string email, string password);
        List<UserDto> GetSuperAdminUsers();
        List<UserDto> GetAdminUsers();
        List<UserDto> GetProgrammerUsers();
    }
}
