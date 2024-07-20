using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using TODOLIST.Data.Entities;
using TODOLIST.Data.Models.ToDo;
using TODOLIST.Exceptions;
using TODOLIST.Services.Implementations;
using TODOLIST.Services.Interfaces;

namespace TODOLIST.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TodoController : ControllerBase
    {
        private readonly IToDoService _toDoService;

        public TodoController(IToDoService toDoService)
        {
            _toDoService = toDoService;
        }

        [HttpPost]
        public ActionResult<ToDoDto> Create([FromBody] CreateToDoRequest createToDoRequest)
        {
            var createdToDoDto = _toDoService.Create(createToDoRequest);

            return CreatedAtAction(nameof(GetById), new { id = createdToDoDto.Id }, createdToDoDto);
        }

        [HttpPut("{id}")]
        public ActionResult<ToDoDto> Update(int id, [FromBody] UpdateToDoRequest request)
        {
            try
            {
                var updatedToDoDto = _toDoService.Update(id, request);

                return Ok(updatedToDoDto);
            }
            catch (NotFoundException)
            {
                return NotFound();
            }
            catch (ForbiddenActionException ex) 
            {
                return Forbid();
            }
        }

        [HttpDelete("{id}")]
        public ActionResult Delete(int id)
        {
            try
            {
                _toDoService.Delete(id);

                return Ok();
            }
            catch (NotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet()]
        public ActionResult<ICollection<ToDoDto>> GetAll([FromQuery] int projectId)
            => Ok(_toDoService.GetByProjectId(projectId));

        [HttpGet("{id}")]
        public ActionResult<ToDoDto> GetById(int id)
        {
            try
            {
                var toDoDto = _toDoService.GetById(id);

                return Ok(toDoDto);
            }
            catch (NotFoundException)
            {
                return NotFound();
            }
        }


        [HttpGet("getbystatus")]
        public ActionResult<IEnumerable<ToDo>> GetByStatus([FromQuery] bool status)
            => Ok(_toDoService.GetByStatus(status));

        [HttpGet("all")]
        public ActionResult<ICollection<ToDoDto>> GetAllTodos()
        {
            var todos = _toDoService.GetAll();
            return Ok(todos);
        }
    }
}
