using ErrorOr;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Globalization;
using TODOLIST.Data.Entities;
using TODOLIST.Data.Models;
using TODOLIST.DBContext;
using TODOLIST.Services.Interfaces;

namespace TODOLIST.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly ToDoContext _context;

        public UserService(ToDoContext context)
        {
            _context = context;
        }

        public User? GetUserByEmail(string email)
        {
            return _context.Users.SingleOrDefault(u => u.Email == email);
        }

        public bool CheckIfUserExists(string userEmail)
        {
            return _context.Users.Any(u => u.Email == userEmail);
        }

        public BaseResponse ValidateUser(string email, string password)
        {
            BaseResponse response = new BaseResponse();
            User? userForLogin = _context.Users.SingleOrDefault(u => u.Email == email);
            if (userForLogin != null) //Si lo encuentra, entra al if (distinto de null)
            {
                if (userForLogin.Password == password)
                {
                    response.Result = true;
                    response.Message = "successful login";
                }
                else
                {
                    response.Result = false;
                    response.Message = "wrong password";
                }
            }
            else
            {
                response.Result = false;
                response.Message = "wrong email";
            }
            return response;
        }

        public User CreateUser(User user)
        {
            _context.Add(user);
            _context.SaveChanges();
            return user;
        }

        public User? UpdateUser(int userId, User updateUser)
        {
            var existingUser = _context.Users.Find(userId);
            if (existingUser == null)
            {
                return null;
            }
            existingUser.UserName = updateUser.UserName;
            existingUser.Password = updateUser.Password;
            existingUser.Email = updateUser.Email;

            _context.SaveChanges();
            return existingUser;

        }

        public bool DeleteUser(int userId)
        {
            User userToBeDeleted = _context.Users.SingleOrDefault(u => u.UserId == userId); //el usuario a borrar va a existir en la BBDD porque el userId viene del token del usuario que inició sesión. Si inicia sesión, su usuario ya existe.
            if (userToBeDeleted != null)
            {
                if (userToBeDeleted.State != false)
                {
                    userToBeDeleted.State = false; //borrado lógico. El usuario seguirá en la BBDD pero con un state 0 (false)
                    _context.Update(userToBeDeleted);
                    _context.SaveChanges();
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else
            {
                throw new ArgumentNullException(nameof(userToBeDeleted), "El User a ser eliminado no fue encontrado.");
            }
        }



        public ErrorOr<List<User>> GetUsersByRole(string role)
        {
            return _context.Users.Where(u => u.UserType == role).ToList();
        }

        public List<User> GetAllUsers()
        {
            return _context.Users.Include(e => e.Project).ToList();
        }

        User? IUserService.GetUserById(int userId)
        {
            return _context.Users.FirstOrDefault(u => u.UserId == userId);
        }
    }
}
