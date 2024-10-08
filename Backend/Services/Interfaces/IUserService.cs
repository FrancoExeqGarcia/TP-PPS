﻿using TODOLIST.Data.Models;
using TODOLIST.Data.Models.User;
using TODOLIST.Data.Models.ToDo;

namespace TODOLIST.Services.Interfaces
{
    public interface IUserService
    {
        List<UserDto> GetAll();
        UserDto GetById(int id);
        UserDto Create(CreateUserRequest request);
        UserDto Update(int id, UpdateUserRequest dto);
        UserDto UpdatePassword(UpdateUserPasswordRequest dto);
        void Delete(int id);

        UserDto GetByEmailAndPassword(string email, string password);
        List<UserDto> GetSuperAdminUsers();
        List<UserDto> GetAdminUsers();
        List<UserDto> GetProgrammerUsers();
        Task<bool> VerifyPasswordAsync(int userId, string password);

    }
}
