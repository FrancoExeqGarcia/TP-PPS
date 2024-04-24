using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using TODOLIST.Data.Entities;
using TODOLIST.DBContext;
using TODOLIST.Services.Interfaces;

namespace TODOLIST.Services.Implementations
{
    public class ProjectService : IProjectService
    {
        private readonly ToDoContext _context;

        public ProjectService(ToDoContext context)
        {
            _context = context;
        }

        public List<Project> GetAllProjects()
        {
            return _context.Project
                .Include(e=> e.ToDos)
                .ToList();
                
        }
        public Project GetProjectById(int id)
        {
            return _context.Project
                .Include(p => p.ToDos)
                .FirstOrDefault(p => p.ProjectId == id);
        }

        public Project CreateProject(Project project)
        {
            _context.Project.Add(project);
            _context.SaveChanges();
            return project;
        }

        public Project UpdateProject(int projectId, Project updatedProject)
        {
            var existingProject =_context.Project.Find(projectId);
            if (existingProject == null) 
            {
                return null;
            }
            existingProject.Name = updatedProject.Name;
            existingProject.StartDate = updatedProject.StartDate;
            existingProject.EndDate = updatedProject.EndDate;
            existingProject.Description = updatedProject.Description;
            
            _context.SaveChanges();
            return existingProject;
        }

        public bool DeleteProject(int projectId)
        {
            Project projectToBeDeleted = _context.Project.SingleOrDefault(u => u.ProjectId == projectId);
            if (projectToBeDeleted != null)
            {
                if (projectToBeDeleted.State != false)
                {
                    projectToBeDeleted.State = false;
                    _context.Update(projectToBeDeleted);
                    _context.SaveChanges();
                    return true;
                }
                else
                {
                    return false;
                }
            }
            {
                throw new ArgumentNullException(nameof(projectToBeDeleted), "El Project a ser eliminado no fue encontrado.");
            }
        }
    }
}
