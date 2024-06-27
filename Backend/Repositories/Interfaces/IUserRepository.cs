using TODOLIST.Data.Entities;

namespace TODOLIST.Repositories.Interfaces
{
    public interface IUserRepository : ICRUDRepository<User>
    {
        ICollection<User> GetSuperAdminUsers();
        ICollection<User> GetAdminUsers();
        ICollection<User> GetProgrammerUsers();
        User GetByEmailAndPassword(string email, string password);
    }
}
