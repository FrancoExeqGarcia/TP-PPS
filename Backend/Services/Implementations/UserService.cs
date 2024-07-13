using TODOLIST.Data.Entities;
using TODOLIST.Data.Models.User;
using TODOLIST.Repositories.Interfaces;
using TODOLIST.Services.Interfaces;
using TODOLIST.DBContext;
using TODOLIST.Enums;
using TODOLIST.Exceptions;

namespace TODOLIST.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repository;

        public UserService(IUserRepository repository)
        {
            _repository = repository;
        }
        public void Delete(int id)
            => _repository.Delete(id);

        public UserDto Create(CreateUserRequest request)
        {
            var entity = new User()
            {
                Email = request.Email,
                Name = request.Name,
                Password = request.Password,
                UserType = (UserRoleEnum)Enum.Parse(typeof(UserRoleEnum), request.UserType),
                State = request.State
            };

            var createdUser = _repository.Create(entity);

            var createdUserDto = new UserDto()
            {
                Email = createdUser.Email,
                Name = createdUser.Name,
                Password = createdUser.Password,
                ProjectAssigned = createdUser.ProjectAssigned,
                ToDosAssigned = createdUser.ToDosAssigned,
                Id = createdUser.Id,
                UserType = createdUser.UserType.ToString(),
                State = createdUser.State
            };

            return createdUserDto;
        }

        public UserDto GetById(int id)
        {
            var user = _repository.GetById(id);

            if (user == null)
                throw new NotFoundException("User not found");

            var userDto = new UserDto()
            {
                Email = user.Email,
                Name = user.Name,
                Password = user.Password,
                ProjectAssigned = user.ProjectAssigned,
                ToDosAssigned = user.ToDosAssigned,
                Id = user.Id,
                UserType = user.UserType.ToString(),
                State = user.State
            };

            return userDto;
        }

        public List<UserDto> GetAll()
        {
            var users = _repository.GetAll();

            var userDtoList = new List<UserDto>();

            foreach (var user in users)
            {
                userDtoList.Add(new UserDto()
                {
                    Email = user.Email,
                    Name = user.Name,
                    Password = user.Password,
                    ProjectAssigned = user.ProjectAssigned,
                    ToDosAssigned = user.ToDosAssigned,
                    Id = user.Id,
                    UserType = user.UserType.ToString(),
                    State = user.State
                });
            };

            return userDtoList;
        }

        public UserDto Update(int id, UpdateUserRequest request)
        {
            var foundUser = _repository.GetById(id)
                ?? throw new NotFoundException("User not found");

            foundUser.Password = request.Password;
            foundUser.State = request.State;
            foundUser.Name = request.Name;
            foundUser.UserType = (UserRoleEnum)Enum.Parse(typeof(UserRoleEnum), request.UserType);

            var updatedUser = _repository.Update(id, foundUser);

            var updatedUserDto = new UserDto()
            {
                Email = updatedUser.Email,
                Name = updatedUser.Name,
                Password = updatedUser.Password,
                ProjectAssigned = updatedUser.ProjectAssigned,
                ToDosAssigned = updatedUser.ToDosAssigned,
                Id = updatedUser.Id,
                UserType = updatedUser.UserType.ToString(),
                State = updatedUser.State
            };

            return updatedUserDto;
        }

        public List<UserDto> GetSuperAdminUsers()
        {
            var users = _repository.GetSuperAdminUsers();

            var usersDtoList = new List<UserDto>();
            foreach (var adminUser in users)
            {
                usersDtoList.Add(new UserDto()
                {
                    Id = adminUser.Id,
                    Name = adminUser.Name,
                    ProjectAssigned = adminUser.ProjectAssigned,
                    ToDosAssigned = adminUser.ToDosAssigned,
                    Email = adminUser.Email,
                    Password = adminUser.Password,
                    State = adminUser.State,
                    UserType = adminUser.UserType.ToString()
                });
            }

            return usersDtoList;
        }

        public List<UserDto> GetAdminUsers()
        {
            var users = _repository.GetAdminUsers();

            var usersDtoList = new List<UserDto>();
            foreach (var adminUser in users)
            {
                usersDtoList.Add(new UserDto()
                {
                    Id = adminUser.Id,
                    Name = adminUser.Name,
                    ProjectAssigned = adminUser.ProjectAssigned,
                    ToDosAssigned = adminUser.ToDosAssigned,
                    Email = adminUser.Email,
                    Password = adminUser.Password,
                    State = adminUser.State,
                    UserType = adminUser.UserType.ToString()
                });
            }

            return usersDtoList;
        }

        public List<UserDto> GetProgrammerUsers()
        {
            var users = _repository.GetProgrammerUsers();

            var usersDtoList = new List<UserDto>();
            foreach (var adminUser in users)
            {
                usersDtoList.Add(new UserDto()
                {
                    Id = adminUser.Id,
                    Name = adminUser.Name,
                    ProjectAssigned = adminUser.ProjectAssigned,
                    ToDosAssigned = adminUser.ToDosAssigned,
                    Email = adminUser.Email,
                    Password = adminUser.Password,
                    State = adminUser.State,
                    UserType = adminUser.UserType.ToString()
                });
            }

            return usersDtoList;
        }

        public UserDto GetByEmailAndPassword(string email, string password)
        {
            var user = _repository.GetByEmailAndPassword(email, password);

            if (user == null)
                throw new NotFoundException("User not found");

            var userDto = new UserDto()
            {
                Email = user.Email,
                Name = user.Name,
                Password = user.Password,
                ProjectAssigned = user.ProjectAssigned,
                ToDosAssigned = user.ToDosAssigned,
                Id = user.Id,
                UserType = user.UserType.ToString(),
                State = user.State
            };

            return userDto;
        }
    }
}