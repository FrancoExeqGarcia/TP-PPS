using TODOLIST.Data.Entities;
using TODOLIST.Services.Interfaces;
using TODOLIST.DBContext;
using Microsoft.EntityFrameworkCore;
using TODOLIST.Data.Models.ToDo;
using TODOLIST.Exceptions;
using TODOLIST.Repositories.Implementations;
using TODOLIST.Repositories.Interfaces;

namespace TODOLIST.Services.Implementations
{
    public class ToDoService : IToDoService
    {
        private readonly IToDoRepository _repository;

        public ToDoService(IToDoRepository repository)
        {
            _repository = repository;
        }

        public void Delete(int id)
            => _repository.Delete(id);

        public ToDoDto Create(CreateToDoRequest request)
        {
            var toDo = new ToDo()
            {
                Name = request.Name,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                CreatedByUserId = request.CreatedByUserId,
                AssignedUserId = request.AssignedUserId,
                IsCompleted = request.IsCompleted,
                ProjectID = request.ProjectID,
                State = request.State
            };

            var createdToDo = _repository.Create(toDo);

            var toDoDto = new ToDoDto()
            {
                Id = toDo.Id,
                Name = toDo.Name,
                StartDate = toDo.StartDate,
                EndDate = toDo.EndDate,
                CreatedByUserId = toDo.CreatedByUserId,
                AssignedUserId = toDo.AssignedUserId,
                IsCompleted = toDo.IsCompleted,
                ProjectID = toDo.ProjectID,
                State = toDo.State
            };

            return toDoDto;
        }

        public ToDoDto GetById(int id)
        {
            var toDo = _repository.GetById(id);

            if (toDo == null)
                throw new NotFoundException("ToDo not found");

            var toDoDto = new ToDoDto()
            {
                Id = toDo.Id,
                Name = toDo.Name,
                StartDate = toDo.StartDate,
                EndDate = toDo.EndDate,
                CreatedByUserId = toDo.CreatedByUserId,
                AssignedUserId = toDo.AssignedUserId,
                IsCompleted = toDo.IsCompleted,
                ProjectID = toDo.ProjectID,
                State = toDo.State
            };

            return toDoDto;
        }

        public List<ToDoDto> GetAll()
        {
            var toDos = _repository.GetAll();

            var toDoDtoList = new List<ToDoDto>();

            foreach (var toDo in toDos)
            {
                toDoDtoList.Add(new ToDoDto()
                {
                    Id = toDo.Id,
                    Name = toDo.Name,
                    StartDate = toDo.StartDate,
                    EndDate = toDo.EndDate,
                    CreatedByUserId = toDo.CreatedByUserId,
                    AssignedUserId = toDo.AssignedUserId,
                    IsCompleted = toDo.IsCompleted,
                    ProjectID = toDo.ProjectID,
                    State = toDo.State
                });
            };

            return toDoDtoList;
        }

        public ToDoDto Update(int id, UpdateToDoRequest dto)
        {
            var toDo = _repository.GetById(id)
                ?? throw new NotFoundException("ToDo not found");

            toDo.Name = dto.Name;
            toDo.StartDate = dto.StartDate;
            toDo.EndDate = dto.EndDate;
            toDo.AssignedUserId = dto.AssignedUserId;
            toDo.IsCompleted = dto.IsCompleted;
            toDo.State = dto.State;

            var updatedToDo = _repository.Update(id, toDo);

            var updatedToDoDto = new ToDoDto()
            {
                Id = toDo.Id,
                Name = toDo.Name,
                StartDate = toDo.StartDate,
                EndDate = toDo.EndDate,
                CreatedByUserId = toDo.CreatedByUserId,
                AssignedUserId = toDo.AssignedUserId,
                IsCompleted = toDo.IsCompleted,
                ProjectID = toDo.ProjectID,
                State = toDo.State
            };

            return updatedToDoDto;
        }

        public List<ToDoDto> GetByStatus(bool status)
        {
            var toDos = _repository.GetByStatus(status);

            var toDoDtoList = new List<ToDoDto>();

            foreach (var toDo in toDos)
            {
                toDoDtoList.Add(new ToDoDto()
                {
                    Id = toDo.Id,
                    Name = toDo.Name,
                    StartDate = toDo.StartDate,
                    EndDate = toDo.EndDate,
                    CreatedByUserId = toDo.CreatedByUserId,
                    AssignedUserId = toDo.AssignedUserId,
                    IsCompleted = toDo.IsCompleted,
                    ProjectID = toDo.ProjectID,
                    State = toDo.State
                });
            };

            return toDoDtoList;
        }

        public ToDoDto UpdateStatus(int id, bool isCompleted)
        {
            var toDo = _repository.GetById(id)
                ?? throw new NotFoundException("ToDo not found");

            toDo.State = isCompleted;

            var updatedToDo = _repository.Update(id, toDo);

            var updatedToDoDto = new ToDoDto()
            {
                Id = toDo.Id,
                Name = toDo.Name,
                StartDate = toDo.StartDate,
                EndDate = toDo.EndDate,
                CreatedByUserId = toDo.CreatedByUserId,
                AssignedUserId = toDo.AssignedUserId,
                IsCompleted = toDo.IsCompleted,
                ProjectID = toDo.ProjectID,
                State = toDo.State
            };

            return updatedToDoDto;
        }

        public List<ToDoDto> GetByProjectId(int projectId)
        {
            var todos = _repository.GetByProjectId(projectId);

            var todoDtoList = new List<ToDoDto>();
            foreach (var todo in todos)
            {
                todoDtoList.Add(new ToDoDto()
                {
                    Id = todo.Id,
                    Name = todo.Name,
                    AssignedUserId = todo.AssignedUserId,
                    AssignedUser = todo.AssignedUser,
                    CreatedByUserId = todo.CreatedByUserId,
                    StartDate = todo.StartDate,
                    EndDate = todo.EndDate,
                    IsCompleted = todo.IsCompleted,
                    ProjectID = todo.ProjectID,
                    Project = todo.Project,
                });
            }

            return todoDtoList;
        }
    }
}
