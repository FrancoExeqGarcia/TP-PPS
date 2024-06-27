using Microsoft.EntityFrameworkCore;
using TODOLIST.Data.Entities;
using TODOLIST.DBContext;
using TODOLIST.Repositories.Interfaces;

namespace TODOLIST.Repositories.Implementations
{
    public class ToDoRepository : CRUDRepository<ToDo>, IToDoRepository
    {
        public ToDoRepository(ToDoContext dbContext) : base(dbContext)
        {
        }

        public List<ToDo> GetByProjectId(int projectId)
            => _dbContext.ToDo.Where(e => e.ProjectID == projectId).ToList();


        public IEnumerable<ToDo> GetByStatus(bool status)
            => _dbContext.ToDo.Where(e => e.State == status).ToList();

        public override ToDo Update(int id, ToDo entity)
        {
            entity.Project = null;
            return base.Update(id, entity);
        }

        public override ToDo Create(ToDo entity)
        {
            entity.Project = null;
            return base.Create(entity);
        }

        public IEnumerable<ToDo> GetExpired()
            => _dbContext.ToDo
                .Include(e => e.AssignedUser)
                .Where(e => !e.IsCompleted && e.EndDate < DateTime.UtcNow && e.AssignedUserId != null)
                .ToList();
    }
}
