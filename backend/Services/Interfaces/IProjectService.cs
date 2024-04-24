using System.Collections.Generic;
using TODOLIST.Data.Entities;

namespace TODOLIST.Services.Interfaces
{
    public interface IProjectService
    {
        List<Project> GetAllProjects();
        Project GetProjectById(int projectId);
        Project CreateProject(Project project);
        Project UpdateProject(int projectId, Project project);
        bool DeleteProject(int projectId);
    }
}
