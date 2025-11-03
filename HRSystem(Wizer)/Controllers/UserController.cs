using AutoMapper;
using HRSystem.BaseLibrary.DTOs;
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace HRSystem_Wizer_.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<UserController> _logger;

        public UserController(
            IUserRepository repository,
            IMapper mapper,
            ILogger<UserController> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
        }

        // Get all users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserReadDto>>> GetAll()
        {
            try
            {
                var users = await _repository.GetAllAsync();
                var userDtos = _mapper.Map<IEnumerable<UserReadDto>>(users);
                return Ok(userDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, "An error occurred while retrieving users");
            }
        }

        // Get user by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<UserReadDto>> GetById(int id)
        {
            try
            {
                var user = await _repository.GetByIdAsync(id);
                if (user == null)
                {
                    return NotFound($"User with ID {id} not found");
                }

                var userDto = _mapper.Map<UserReadDto>(user);
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user with ID {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the user");
            }
        }

        // Register a new user
        [HttpPost("register")]
        public async Task<ActionResult<UserReadDto>> Register([FromBody] UserRegisterDto registerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Check if username already exists
                var existingUser = await _repository.GetByUsernameAsync(registerDto.Username);
                if (existingUser != null)
                {
                    return Conflict($"Username '{registerDto.Username}' is already taken");
                }

                // Check if employee already has a user account
                var existingUserByEmployee = await _repository.GetByEmployeeIdAsync(registerDto.EmployeeId);
                if (existingUserByEmployee != null)
                {
                    return Conflict($"Employee with ID {registerDto.EmployeeId} already has a user account");
                }

                // Hash the password using BCrypt
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

                var user = _mapper.Map<TPLUser>(registerDto);
                user.PasswordHash = passwordHash;

                await _repository.AddAsync(user);
                await _repository.SaveChangesAsync();

                var userDto = _mapper.Map<UserReadDto>(user);
                return CreatedAtAction(nameof(GetById), new { id = user.UserID }, userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering user");
                return StatusCode(500, "An error occurred while registering the user");
            }
        }

        // User login
        [HttpPost("login")]
        public async Task<ActionResult<UserReadDto>> Login([FromBody] UserLoginDto loginDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var user = await _repository.GetByUsernameAsync(loginDto.Username);
                if (user == null)
                {
                    return Unauthorized("Invalid username or password");
                }

                // Verify password using BCrypt
                var isValidPassword = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);
                if (!isValidPassword)
                {
                    return Unauthorized("Invalid username or password");
                }

                var userDto = _mapper.Map<UserReadDto>(user);
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, "An error occurred during login");
            }
        }

        // Update user role
        [HttpPut("{id}/role")]
        public async Task<ActionResult<UserReadDto>> UpdateRole(int id, [FromBody] string role)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(role))
                {
                    return BadRequest("Role cannot be empty");
                }

                var user = await _repository.GetByIdAsync(id);
                if (user == null)
                {
                    return NotFound($"User with ID {id} not found");
                }

                user.Role = role;
                await _repository.UpdateAsync(user);
                await _repository.SaveChangesAsync();

                var userDto = _mapper.Map<UserReadDto>(user);
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user role for ID {Id}", id);
                return StatusCode(500, "An error occurred while updating the user role");
            }
        }

        // Delete a user
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var user = await _repository.GetByIdAsync(id);
                if (user == null)
                {
                    return NotFound($"User with ID {id} not found");
                }

                await _repository.DeleteAsync(user);
                await _repository.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user with ID {Id}", id);
                return StatusCode(500, "An error occurred while deleting the user");
            }
        }
    }
}

