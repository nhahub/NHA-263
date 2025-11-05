using Azure.Core;
using HRSystem.BaseLibrary.DTOs;
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace HRSystem.Infrastructure.Implementations
{
    public class AuthService: IAuthService
    {
        
            private readonly HRSystemContext _context;
            private readonly ITokenService _tokenService;
            private readonly IConfiguration _configuration;

        public AuthService(HRSystemContext context, ITokenService tokenService ,IConfiguration configuration)
            {
                _context = context;
                _tokenService = tokenService;
                _configuration = configuration;
        }

            public async Task<UserReadDto> RegisterAsync(UserRegisterDto request )
            {
                var existingUser = await _context.TPLUsers
                    .FirstOrDefaultAsync(u => u.Username == request.Username);

                if (existingUser != null)
                    throw new Exception("Username already exists");

                if (_context.TPLEmployees.FirstOrDefault(
                user => user.EmployeeID == request.EmployeeId) == null)
                {
                    throw new Exception("Employee not found. Provide a valid EmployeeId.");
                }
                int deptid = _context.TPLEmployees
                    .Where(e => e.EmployeeID == request.EmployeeId)
                    .Select(e => e.DepartmentID)
                    .FirstOrDefault();
                string depNameEn = _context.LkpHRDepartments
                        .Where(d => d.DepartmentId == deptid)
                        .Select(d => d.NameEn)
                        .FirstOrDefault();

                if (depNameEn.Equals("Human Resources"))
                    { 
                        request.Role = "HR";
                }
                else if (depNameEn.Equals("General Administration"))
                    {
                        request.Role = "admin";
                }
                else
                {
                    request.Role = "Employee";
                }

                var newUser = new TPLUser
                        {
                            EmployeeID = request.EmployeeId,
                            Username = request.Username,
                            Role = request.Role
                    
                    };

                var hashedPassword = new PasswordHasher<TPLUser>()
                        .HashPassword(newUser, request.Password);
                newUser.PasswordHash = hashedPassword;

                _context.TPLUsers.Add(newUser);
                    await _context.SaveChangesAsync();

                
                return new UserReadDto
                {
                    UserId = newUser.UserID,
                    EmployeeId = newUser.EmployeeID,
                    
                    Username = newUser.Username,
                    Role = newUser.Role,
                    Token = null,
                    RefreshToken = null,
                    TokenExpires = DateTime.MinValue
                };
        }

            public async Task<UserReadDto> LoginAsync(UserLoginDto request)
            {
                var user = await _context.TPLUsers
                    .Include(u => u.Employee)
                    .FirstOrDefaultAsync(u => u.Username == request.Username);

                if (user == null || !VerifyPassword(user,request.Password, user.PasswordHash))
                    throw new Exception("Invalid username or password");

                var token = await _tokenService.GenerateJwtTokenAsync(user);
                var refreshToken = await _tokenService.GenerateRefreshTokenAsync();

                var refreshTokenEntity = new RefreshToken
                {
                    Token = refreshToken,
                    UserId = user.UserID,
                    Created = DateTime.UtcNow,
                    Expires = DateTime.UtcNow.AddDays(14)
                };

                _context.RefreshTokens.Add(refreshTokenEntity);
                await _context.SaveChangesAsync();

                 var userReadDto=   new UserReadDto
                {
                    UserId = user.UserID,
                    EmployeeId = user.EmployeeID,
                    Username = user.Username,
                    Role = user.Role,
                    Token = token,
                    RefreshToken = refreshToken,
                    TokenExpires = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["Jwt:ExpireMinutes"]))
                };
                return userReadDto;
            }

            public async Task<UserReadDto> RefreshTokenAsync(string refreshToken)
            {
            
                var storedToken = await _context.RefreshTokens
                    .Include(rt => rt.User)
                    .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

                if (storedToken == null)
                    throw new Exception("Invalid refresh token.");

                
                if (storedToken.Expires < DateTime.UtcNow)
                    throw new Exception("Refresh token has expired.");

                if (storedToken.Revoked != null)
                    throw new Exception("Refresh token has been revoked.");

               
                var newJwtToken = await _tokenService.GenerateJwtTokenAsync(storedToken.User);
                var newRefreshToken = await _tokenService.GenerateRefreshTokenAsync();

                
                storedToken.Revoked = DateTime.UtcNow;

                var newTokenEntry = new RefreshToken
                {
                    Token = newRefreshToken,
                    UserId = storedToken.UserId,
                    Created = DateTime.UtcNow,
                    Expires = DateTime.UtcNow.AddDays(14) 
                };

                _context.RefreshTokens.Add(newTokenEntry);
                await _context.SaveChangesAsync();

                
                var NewUserReadDto = new UserReadDto();

                NewUserReadDto.UserId = storedToken.User.UserID;
                    NewUserReadDto.EmployeeId = storedToken.User.EmployeeID;
                    NewUserReadDto.Username = storedToken.User.Username;
                    NewUserReadDto.Role = storedToken.User.Role;
                    NewUserReadDto.Token = newJwtToken;
                    NewUserReadDto.RefreshToken = newRefreshToken;
                    NewUserReadDto.TokenExpires = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["Jwt:ExpireMinutes"]));
            
                return NewUserReadDto;
        }

            public async Task<bool> LogoutAsync(string username)
            {
                var user = await _context.TPLUsers
                    .Include(u => u.RefreshTokens)
                    .FirstOrDefaultAsync(u => u.Username == username);

                if (user == null) return false;

                foreach (var token in user.RefreshTokens.Where(t => t.Revoked == null))
                {
                    token.Revoked = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                return true;
        }

            private bool VerifyPassword(TPLUser existingUser ,string password, string storedHash)
            {
                var hashOfInput = new PasswordHasher<TPLUser>()
                    .VerifyHashedPassword(existingUser,storedHash, password);
                return hashOfInput == PasswordVerificationResult.Success;
            }
        }
}
