using TODOLIST.Data.Entities;

namespace TODOLIST.Repositories.Interfaces
{
    public interface IToDoRepository : ICRUDRepository<ToDo>
    {
        List<ToDo> GetByProjectId(int projectId);
        IEnumerable<ToDo> GetByStatus(bool status);
        IEnumerable<ToDo> GetExpired();
    }
}
