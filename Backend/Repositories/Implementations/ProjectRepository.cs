using System.Collections.Generic;
using TODOLIST.Data.Entities;
using TODOLIST.DBContext;
using TODOLIST.Repositories.Interfaces;
using TODOLIST.Services.Interfaces;

namespace TODOLIST.Repositories.Implementations
{
    public class ProjectRepository : CRUDRepository<Project>, IProjectRepository
    {
        public ProjectRepository(ToDoContext dbContext) : base(dbContext)
        {
        }
    }
}
