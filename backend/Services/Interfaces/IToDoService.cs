using ErrorOr;
using System.Collections.Generic;
using TODOLIST.Data.Entities;
using TODOLIST.Data.Models.ToDo;

namespace TODOLIST.Services.Interfaces
{
    public interface IToDoService
    {
        List<ToDoDto> GetAll();
        ToDoDto GetById(int id);
        ToDoDto Create(CreateToDoRequest request);
        ToDoDto Update(int id, UpdateToDoRequest dto);
        void Delete(int id);

        List<ToDoDto> GetByProjectId(int projectId);
        List<ToDoDto> GetByStatus(bool status);

        ToDoDto UpdateStatus(int id, bool isCompleted);
    }
}
