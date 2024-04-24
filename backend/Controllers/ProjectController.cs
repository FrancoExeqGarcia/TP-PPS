using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using TODOLIST.Data.Entities;
using TODOLIST.Data.Models;
using TODOLIST.Services.Implementations;
using TODOLIST.Services.Interfaces;

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

        [HttpGet]
        public ActionResult<IEnumerable<Project>> Get()
        {
            var projects = _projectService.GetAllProjects();
            return Ok(projects);
        }

        [HttpGet("{id}")]
        public ActionResult<Project> GetProject(int id)
        {
            var project = _projectService.GetProjectById(id);
            if (project == null)
            {
                return NotFound();
            }
            return Ok(project);
        }
        [HttpPost]
        [Authorize(Roles = "SuperAdmin, Admin")]
        public IActionResult CreateProject([FromBody] ProjectCreateDto projectCreateDto)
        {
            var roleClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
            string role = roleClaim != null ? roleClaim.Value : "DefaultRole"; // Asignar un valor por defecto si no se encuentra la reclamación de rol            if (role != "Programer")
            if(role != "Programer")
            {
                {
                    var project = new Project
                    {
                        Name = projectCreateDto.Name,
                        StartDate = projectCreateDto.StartDate,
                        EndDate = projectCreateDto.EndDate,
                        Description = projectCreateDto.Description,
                        UserID = projectCreateDto.UserID,
                    };

                    try
                    {
                        var createdProject = _projectService.CreateProject(project);
                        return CreatedAtAction(nameof(GetProject), new { id = createdProject.ProjectId }, createdProject);
                    }
                    catch
                    {
                        return Conflict("Error al crear el proyecto. Conflicto detectado");
                    }
                }
            }
            else
            {
                return Forbid();
            }
        }

        [HttpPut]
        [Authorize(Roles = "SuperAdmin, Admin")]
        public IActionResult UpdateProject(int projectId, [FromBody] ProjectUpdateDto projectUpdateDto)
        {
            var roleClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
            string role = roleClaim != null ? roleClaim.Value : "DefaultRole";
            if(role !="Programer")
            {
                {
                    var updatedProject = new Project
                    {
                        Name = projectUpdateDto.Name,
                        StartDate = projectUpdateDto.StartDate,
                        EndDate = projectUpdateDto.EndDate,
                        Description = projectUpdateDto.Description
                    };

                    try
                    {
                        var result = _projectService.UpdateProject(projectId, updatedProject);
                        if (result == null)
                        {
                            return NotFound();
                        }
                        return Ok(result);
                    }
                    catch (Exception ex)
                    {
                        return BadRequest(ex.Message);
                    }
                }
            }
            else
            {
                return Forbid();
            }
            
        }


        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin, Admin")]
        public IActionResult DeleteProject(int id)
        {
            var roleClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
            string role = roleClaim != null ? roleClaim.Value : "DefaultRole";
            if (role != "Programer")
            {
                try
                {
                    if (_projectService.DeleteProject(id))
                    {
                        return Ok($"Project {id} eliminado");
                    }
                }
                catch (Exception ex)
                {
                    return Conflict(ex.Message);
                }
            }
            return Forbid();
        }
    }
}
