using HRSystem.BaseLibrary.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRSystem.Infrastructure.Contracts
{
    public interface IAuthService
    {
        Task<UserReadDto> RegisterAsync(UserRegisterDto request);
        Task<UserReadDto> LoginAsync(UserLoginDto request);
        Task<UserReadDto> RefreshTokenAsync(string refreshToken);
        Task<bool> LogoutAsync(string username);
    }
}
