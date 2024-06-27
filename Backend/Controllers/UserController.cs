using ErrorOr;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Primitives;
using System.Collections.Generic;
using System.Security.Claims;
using TODOLIST.Data.Entities;
using TODOLIST.Data.Models.User;
using TODOLIST.Enums;
using TODOLIST.Exceptions;
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

        [HttpPost]
        public ActionResult<UserDto> Create([FromBody] CreateUserRequest request)
        {
            var createdUserDto = _userService.Create(request);

            return CreatedAtAction(nameof(GetById), new { id = createdUserDto.Id }, createdUserDto);
        }

        [HttpPut("{id}")]
        public ActionResult<UserDto> Update(int id, [FromBody] UpdateUserRequest request)
        {
            try
            {
                var updatedUserDto = _userService.Update(id, request);

                return Ok(updatedUserDto);
            }
            catch (NotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        public ActionResult Delete(int id)
        {
            try
            {
                _userService.Delete(id);

                return Ok();
            }
            catch (NotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet()]
        public ActionResult<ICollection<UserDto>> GetAll()
            => Ok(_userService.GetAll());

        [HttpGet("{id}")]
        public ActionResult<UserDto> GetById(int id)
        {
            try
            {
                var userDto = _userService.GetById(id);

                return Ok(userDto);
            }
            catch (NotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("admins")]
        public ActionResult<IEnumerable<UserDto>> GetAdminUsers()
        {
            var users = _userService.GetAdminUsers();
            return Ok(users);
        }


        [HttpGet("superadmins")]
        public ActionResult<IEnumerable<UserDto>> GetSuperAdminUsers()
        {
            var users = _userService.GetSuperAdminUsers();
            return Ok(users);
        }


        [HttpGet("programmers")]
        public ActionResult<IEnumerable<UserDto>> GetProgrammerUsers()
        {
            var users = _userService.GetProgrammerUsers();
            return Ok(users);
        }
    }
}