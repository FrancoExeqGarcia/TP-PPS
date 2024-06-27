using TODOLIST.Data.Entities;
using TODOLIST.DBContext;
using TODOLIST.Repositories.Interfaces;

namespace TODOLIST.Repositories.Implementations
{
    public class UserRepository : CRUDRepository<User>, IUserRepository
    {
        public UserRepository(ToDoContext dbContext) : base(dbContext)
        {
        }

        public ICollection<User> GetAdminUsers()
        {
            var users = _dbContext
                .Users
                //.Where(e => e.UserType == Enums.UserRoleEnum.Admin)
                .ToList();

            return users;
        }

        public ICollection<User> GetSuperAdminUsers()
        {
            var users = _dbContext
                .Users
                //.Where(e => e.UserType == Enums.UserRoleEnum.SuperAdmin)
                .ToList();

            return users;
        }

        public ICollection<User> GetProgrammerUsers()
        {
            var users = _dbContext
                .Users
                //.Where(e => e.UserType == Enums.UserRoleEnum.Programer)
                .ToList();

            return users;
        }

        public User GetByEmailAndPassword(string email, string password)
        {
            var user = _dbContext
                .Users
                .First(e => e.Email == email && e.Password == password);

            return user;
        }
    }
}
