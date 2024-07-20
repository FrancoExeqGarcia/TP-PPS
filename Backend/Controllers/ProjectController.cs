using Microsoft.AspNetCore.Mvc;
using TODOLIST.Exceptions;
using TODOLIST.Services.Interfaces;
using TODOLIST.Data.Models.Project;
using TODOLIST.Data.Models;
using TODOLIST.Data.Models.ToDo;
using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;

namespace TODOLIST.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin, Admin")]
        public ActionResult<ProjectDto> Create([FromBody] CreateProjectRequest request)
        {
            var createdProjectDto = _projectService.Create(request);

            return CreatedAtAction(nameof(GetById), new { id = createdProjectDto.Id }, createdProjectDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public ActionResult<ProjectDto> Update(int id, [FromBody] UpdateProjectRequest request)
        {
            try
            {
                var updatedProjectDto = _projectService.Update(id, request);

                return Ok(updatedProjectDto);
            }
            catch (NotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin, Admin")]
        public ActionResult Delete(int id)
        {
            try
            {
                _projectService.Delete(id);

                return Ok();
            }
            catch (NotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet()]
        public ActionResult<ICollection<ProjectDto>> GetAll()
        {
            return Ok(_projectService.GetAll());
        }


        [HttpGet("{id}")]
        public ActionResult<ProjectDto> GetById(int id)
        {
            try
            {
                var projectDto = _projectService.GetById(id);

                return Ok(projectDto);
            }
            catch (NotFoundException)
            {
                return NotFound();
            }
        }
    }
}
