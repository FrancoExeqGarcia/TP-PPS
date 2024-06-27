using System.Collections.Generic;
using TODOLIST.Data.Models.Project;
using TODOLIST.Data.Entities;
using TODOLIST.Data.Models;
using TODOLIST.Data.Models.ToDo;

namespace TODOLIST.Services.Interfaces
{
    public interface IProjectService
    {
        List<ProjectDto> GetAll();
        ProjectDto GetById(int id);
        ProjectDto Create(CreateProjectRequest request);
        ProjectDto Update(int id, UpdateProjectRequest dto);
        void Delete(int id);
    }
}