using TODOLIST.Exceptions;
using TODOLIST.Repositories.Interfaces;
using TODOLIST.Services.Interfaces;
using TODOLIST.Data.Models.Project;
using TODOLIST.Services;
using TODOLIST.Data.Models;
using TODOLIST.Data.Models.ToDo;
using TODOLIST.Data.Entities;

namespace TODOLIST.Services.Implementations
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _repository;

        public ProjectService(IProjectRepository repository)
        {
            _repository = repository;
        }

        public void Delete(int id)
            => _repository.Delete(id);

        public ProjectDto GetById(int id)
        {
            var project = _repository.GetById(id);

            if (project == null)
                throw new NotFoundException("Project not found");

            var projectDto = new ProjectDto()
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                CreatedByUserId = project.CreatedByUserId,
                State = project.State,
                Collaborators = project.Collaborators
            };

            return projectDto;
        }

        public List<ProjectDto> GetAll()
        {
            var projects = _repository.GetAll();

            var projectDtoList = new List<ProjectDto>();

            foreach (var project in projects)
            {
                projectDtoList.Add(new ProjectDto()
                {
                    Id = project.Id,
                    Name = project.Name,
                    Description = project.Description,
                    StartDate = project.StartDate,
                    EndDate = project.EndDate,
                    CreatedByUserId = project.CreatedByUserId,
                    State = project.State,
                    Collaborators = project.Collaborators
                });
            };

            return projectDtoList;
        }

        public ProjectDto Update(int id, UpdateProjectRequest dto)
        {
            var foundProject = _repository.GetById(id)
                ?? throw new NotFoundException("Project not found");

            foundProject.Name = dto.Name;
            foundProject.Description = dto.Description;
            foundProject.StartDate = dto.StartDate;
            foundProject.EndDate = dto.EndDate;
            // foundProject.Collaborators = dto.CollaboratorsIds;

            var updatedProject = _repository.Update(id, foundProject);

            var updatedProjectDto = new ProjectDto()
            {
                Id = foundProject.Id,
                Name = foundProject.Name,
                Description = foundProject.Description,
                StartDate = foundProject.StartDate,
                EndDate = foundProject.EndDate,
                CreatedByUserId = foundProject.CreatedByUserId,
                State = foundProject.State,
                Collaborators = foundProject.Collaborators
            };

            return updatedProjectDto;
        }

        public ProjectDto Create(CreateProjectRequest request)
        {
            var project =
                ProjectBuilder
                    .Init()
                    .WithName(request.Name)
                    .WithDescripcion(request.Description ?? string.Empty)
                    .WithStartDate(request.StartDate)
                    .WithEndDate(request.EndDate)
                    .AddCollaborators([.. request.CollaboratorIds])
                    //.WithToDos([.. request.ToDos])
                    .Build();

            var createdProject = _repository.Create(project);

            var projectDto = new ProjectDto()
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                CreatedByUserId = project.CreatedByUserId,
                State = project.State,
                Collaborators = project.Collaborators
            };

            return projectDto;
        }
    }
}
