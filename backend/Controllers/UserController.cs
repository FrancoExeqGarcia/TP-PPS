using ErrorOr;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Primitives;
using System.Collections.Generic;
using System.Security.Claims;
using TODOLIST.Data.Entities;
using TODOLIST.Data.Models;
using TODOLIST.Enums;
using TODOLIST.Services.Implementations;
using TODOLIST.Services.Interfaces;

namespace TODOLIST.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public ActionResult<IEnumerable<User>> GetAllUsers()
        {
            var users = _userService.GetAllUsers();
            return Ok(users);
        }
        [HttpGet("admins")]
        public ActionResult<IEnumerable<UserDto>> GetAdminUsers()
        {

            var users = _userService.GetAdminUsers();
            return Ok(users);
        }
        [HttpGet("{id}")]
        public ActionResult<IEnumerable<User>> GetUserById(int id)
        {
            var user = _userService.GetUserById(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }
        [HttpGet("profile")]
        public ActionResult<UserDto> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = _userService.GetUserById(int.Parse(userId));
            if (user == null)
            {
                return NotFound();
            }

            var userDto = new UserDto
            {
                UserId = user.UserId,
                Email = user.Email,
                UserName = user.UserName,
                UserType = user.UserType
            };

            return Ok(userDto);
        }



        [HttpPost]
        [Authorize(Roles = "SuperAdmin")]
        public IActionResult CreateProgramer([FromBody] ProgramerPostDto programerPostDto) //sería la registración de un nuevo cliente
        {
            var roleClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
            string role = roleClaim != null ? roleClaim.Value : "DefaultRole";
            if (role == "SuperAdmin")
            {
                if (!_userService.CheckIfUserExists(programerPostDto.Email))
                {
                    Programer programer = new Programer()
                    {
                        Email = programerPostDto.Email,
                        Password = programerPostDto.Password,
                        UserName = programerPostDto.UserName,
                    };
                    var createdProgramer = _userService.CreateUser(programer);
                    return CreatedAtAction(nameof(GetAllUsers), new { id = createdProgramer.UserId }, createdProgramer);
                }
                else
                {
                    return Conflict("Client already exists");
                }
            }
            return Forbid();
        }

        [HttpPost("admin/")]
        [Authorize(Roles = "SuperAdmin")]

        public IActionResult CreateAdmin([FromBody] AdminPostDto adminPostDto)
        {
            var roleClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
            string role = roleClaim != null ? roleClaim.Value : "DefaultRole";

            if (role == "SuperAdmin")
            {
                Admin admin = new Admin()
                {
                    Email = adminPostDto.Email,
                    Password = adminPostDto.Password,
                    UserName = adminPostDto.UserName,
                    UserType = nameof(UserRoleEnum.Admin)
                };
                var createdAdmin = _userService.CreateUser(admin);
                return CreatedAtAction(nameof(GetAllUsers), new { id = createdAdmin.UserId }, createdAdmin);
            }
            return Forbid();
        }


        [HttpPut]
        [Authorize(Roles = "SuperAdmin")]
        public IActionResult UpdateProgramer(int userId, [FromBody] ProgramerUpdateDto programerUpdateDto)
        {
            var roleClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
            string role = roleClaim != null ? roleClaim.Value : "DefaultRole";
            if (role == "SuperAdmin")
            {
                    var updatedProgramer = new Programer
                {
                    Email = programerUpdateDto.Email,
                    UserName = programerUpdateDto.UserName,
                    Password = programerUpdateDto.Password,
                };
                try
                {
                    var result = _userService.UpdateUser(userId, updatedProgramer);
                    if (result == null)
                    {
                        return NotFound();
                    }
                    return Ok(result);
                }
                catch (Exception ex)
                {
                    return StatusCode(500, ex.Message);
                }
            }
            return Forbid();
        }


        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin")]
        public ActionResult DeleteUser(int id)
        {
            var roleClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
            string role = roleClaim != null ? roleClaim.Value : "DefaultRole";
            if (role == "SuperAdmin")
            {
                try
                {
                if (_userService.DeleteUser(id))
                    {
                        return Ok($"User {id} eliminado");
                    }
                }
                catch (Exception ex)
                {
                return StatusCode(500, ex.Message); 
                }
            }
            return Forbid();
        }


    }
}