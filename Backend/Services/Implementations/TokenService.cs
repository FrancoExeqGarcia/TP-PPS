using System.IdentityModel.Tokens.Jwt;
using TODOLIST.Services.Interfaces;
using System;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace TODOLIST.Services.Implementations
{
    public class TokenService : ITokenService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TokenService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        private JwtSecurityToken GetToken()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
            {
                throw new InvalidOperationException("No HTTP context available.");
            }

            var token = httpContext.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            if (string.IsNullOrEmpty(token))
            {
                throw new InvalidOperationException("No token provided.");
            }

            var jwtToken = new JwtSecurityTokenHandler().ReadToken(token) as JwtSecurityToken;
            if (jwtToken == null)
            {
                throw new InvalidOperationException("Invalid token.");
            }
            return jwtToken;
        }

        public int GetUserId()
        {
            var jwtToken = GetToken();
            var userIdClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == "sub");
            if (userIdClaim == null)
            {
                throw new InvalidOperationException("User ID claim not found.");
            }

            return int.Parse(userIdClaim.Value);
        }
        public string GetRole()
        {
            var jwtToken = GetToken();
            var roleClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == "role");
            if (roleClaim == null)
            {
                throw new InvalidOperationException("role claim not found.");
            }

            return roleClaim.Value;

        }

    }
}

    
