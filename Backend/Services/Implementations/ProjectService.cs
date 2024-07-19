using TODOLIST.Data.Entities;
using TODOLIST.Data.Models.Project;
using TODOLIST.Exceptions;
using TODOLIST.Repositories.Interfaces;
using TODOLIST.Services.Interfaces;

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
            State = project.State ? 1 : 0,
            ProjectState = project.ProjectState,
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
                State = project.State ? 1 : 0,
                ProjectState = project.ProjectState,
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
        foundProject.State = dto.State == 1 ? true : false;
        foundProject.ProjectState = dto.ProjectState;

        var updatedProject = _repository.Update(id, foundProject);

        var updatedProjectDto = new ProjectDto()
        {
            Id = foundProject.Id,
            Name = foundProject.Name,
            Description = foundProject.Description,
            StartDate = foundProject.StartDate,
            EndDate = foundProject.EndDate,
            CreatedByUserId = foundProject.CreatedByUserId,
            State = foundProject.State ? 1 : 0,
            ProjectState = foundProject.ProjectState,
            Collaborators = foundProject.Collaborators
        };

        return updatedProjectDto;
    }

    public ProjectDto Create(CreateProjectRequest request)
    {
        var project = new Project()
        {
            Name = request.Name,
            Description = request.Description ?? string.Empty,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            ProjectState = request.ProjectState,
            Collaborators = request.CollaboratorIds.Select(id => new User { Id = id }).ToList()
        };

        var createdProject = _repository.Create(project);

        var projectDto = new ProjectDto()
        {
            Id = createdProject.Id,
            Name = createdProject.Name,
            Description = createdProject.Description,
            StartDate = createdProject.StartDate,
            EndDate = createdProject.EndDate,
            CreatedByUserId = createdProject.CreatedByUserId,
            State = createdProject.State ? 1 : 0,
            ProjectState = createdProject.ProjectState,
            Collaborators = createdProject.Collaborators
        };

        return projectDto;
    }
}
