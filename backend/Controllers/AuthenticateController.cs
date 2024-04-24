using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TODOLIST.Data.Entities;
using TODOLIST.Services.Interfaces;
using TODOLIST.Data.Models;

namespace TODOLIST.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticateController : ControllerBase
    {
        public IUserService _userService;
        public IConfiguration _config;

        public AuthenticateController(IUserService userService, IConfiguration config)
        {
            _userService = userService;
            _config = config;
        }

        [HttpPost]
        public IActionResult Authenticate([FromBody] CredentialsDto credentialsDto)
        {
            if (credentialsDto != null && credentialsDto.Email != null && credentialsDto.Password != null)
            {
                // Valido usuario
                BaseResponse validateUserResult = _userService.ValidateUser(credentialsDto.Email, credentialsDto.Password);
                if (validateUserResult.Message == "wrong email")
                {
                    return BadRequest(validateUserResult.Message);
                }
                else if (validateUserResult.Message == "wrong password")
                {
                    return Unauthorized();
                }
                if (validateUserResult.Result)
                {
                    // Obtener usuario
                    User user = _userService.GetUserByEmail(credentialsDto.Email);
                    if (user != null)
                    {
                        // Crear el token
                        var securityPassword = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_config["Authentication:SecretForKey"])); // Traemos la SecretKey del Json
                        var signature = new SigningCredentials(securityPassword, SecurityAlgorithms.HmacSha256);

                        // Los claims son datos en clave->valor que nos permiten guardar data del usuario.
                        var claimsForToken = new List<Claim>();
                        claimsForToken.Add(new Claim("sub", user.UserId.ToString())); // sub es una key estándar (unique user identifier)
                        claimsForToken.Add(new Claim("email", user.Email));
                        claimsForToken.Add(new Claim("role", user.UserType)); // Puede ser "Programer", "Admin" o "SuperAdmin"

                        var jwtSecurityToken = new JwtSecurityToken(
                            _config["Authentication:Issuer"],
                            _config["Authentication:Audience"],
                            claimsForToken,
                            DateTime.UtcNow,
                            DateTime.UtcNow.AddHours(1),
                            signature);

                        string tokenToReturn = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken);
                        return Ok(tokenToReturn);
                    }
                    else
                    {
                        return BadRequest("Usuario no encontrado");
                    }
                }
                return BadRequest();
            }
            else
            {
                return BadRequest("Credenciales inválidas");
            }
        }

    }
}
