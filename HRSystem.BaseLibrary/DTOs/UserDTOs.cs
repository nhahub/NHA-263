// DTOs for TPLUser Entity (Authentication and Authorization)

using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRSystem.BaseLibrary.DTOs
{
    // =================================================================================
    // 1. READ DTO (OUTPUT): Data sent to the Frontend (GET Requests)
    // =================================================================================
    public class UserReadDto
    {
        // Internal ID (PK)
        public int UserId { get; set; }
        public int EmployeeId { get; set; }

        // Security Info (safe to expose)
        public string Username { get; set; }
        public string Role { get; set; }


        // Tokens Info
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public DateTime TokenExpires { get; set; }
    }

    // =================================================================================
    // 2. REGISTER DTO (INPUT): Data received to create a new user (POST / Register)
    // =================================================================================
    public class UserRegisterDto
    {
        [Required(ErrorMessage = "Username is required.")]
        [StringLength(50, ErrorMessage = "Username cannot exceed 50 characters.")]
        public string Username { get; set; }

        [Required(ErrorMessage = "Employee ID is required to link the user account.")]
        public int EmployeeId { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        [DataType(DataType.Password)]
        // Custom validation for strong password (e.g., minimum length 8)
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Password confirmation is required.")]
        [DataType(DataType.Password)]
        // Ensures Password and ConfirmPassword match before processing
        [Compare("Password", ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; set; }

        
        [StringLength(50, ErrorMessage = "Role name cannot exceed 50 characters.")]
        public string Role { get; set; } = "Employee";
    }

    // =================================================================================
    // 3. LOGIN DTO (INPUT): Data received for authentication (POST / Login)
    // =================================================================================
    public class UserLoginDto
    {
        [Required(ErrorMessage = "Username is required.")]
        [StringLength(50)]
        public string Username { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        [DataType(DataType.Password)]
        public string Password { get; set; }
    }
}
