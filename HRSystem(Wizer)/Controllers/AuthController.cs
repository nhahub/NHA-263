using HRSystem.BaseLibrary.DTOs;
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Data;

namespace HRSystem_Wizer_.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // ========================== Register (Sign Up) ==========================
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // هنا بنسجل المستخدم
                var result = await _authService.RegisterAsync(request);

               
                // ممكن نعمله Login بعد التسجيل بدل ما نرجع توكن مباشرة
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ========================== Login (Sign In) ==========================
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] UserLoginDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _authService.LoginAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message , innerError = ex.InnerException?.Message });
            }
        }

        // ========================== Refresh Token ==========================
        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshToken([FromBody] string refreshToken)
        {
            if (string.IsNullOrEmpty(refreshToken))
                return BadRequest(new { message = "Refresh token is required." });

            try
            {
                UserReadDto result = await _authService.RefreshTokenAsync(refreshToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        // ========================== Logout ==========================
        [HttpPost("logout")]
        [Authorize] // لازم يكون المستخدم مسجل دخول
        public async Task<IActionResult> Logout()
        {
            try
            {
                // نجيب اسم المستخدم من التوكن الحالي
                var username = User.Identity?.Name;

                if (string.IsNullOrEmpty(username))
                    return Unauthorized();

                var result = await _authService.LogoutAsync(username);
                if (!result)
                    return BadRequest(new { message = "Logout failed." });

                return Ok(new { message = "Logged out successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


    }
}
