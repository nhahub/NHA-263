// DTOs for TPLEmployee Entity (Central Employee Data)

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace HRSystem.BaseLibrary.DTOs
{
    // =================================================================================
    // 1. READ DTO (OUTPUT): General employee information
    // =================================================================================
    public class EmployeeReadDto
    {
        public int EmployeeId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public DateTime HireDate { get; set; }

        // Foreign Keys (usually mapped to names in final output, but kept for clarity)
        public int JobId { get; set; }
        public int DepartmentId { get; set; }

        // Status
        public string EmploymentStatus { get; set; }

        // Optional: Related data for display
        public string DepartmentName { get; set; }
        public string JobTitle { get; set; }
    }

    // =================================================================================
    // 2. CREATE DTO (INPUT): Used after the candidate is accepted (HR action)
    // =================================================================================
    public class EmployeeCreateDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100)]
        public string Name { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        [StringLength(100)]
        public string Email { get; set; }

        [Required(ErrorMessage = "Phone is required.")]
        [Phone(ErrorMessage = "Invalid phone number format.")]
        [StringLength(20)]
        public string Phone { get; set; }

        [Required(ErrorMessage = "Hire Date is required.")]
        public DateTime HireDate { get; set; }

        [Required(ErrorMessage = "Job ID is required.")]
        public int JobId { get; set; }

        [Required(ErrorMessage = "Department ID is required.")]
        public int DepartmentId { get; set; }

        [Required(ErrorMessage = "Employment Status is required.")]
        [StringLength(50)]
        public string EmploymentStatus { get; set; } // e.g., 'Full-Time', 'Probation'
    }

    // =================================================================================
    // 3. UPDATE DTO (INPUT): Used to modify employee details
    // =================================================================================
    public class EmployeeUpdateDto : EmployeeCreateDto
    {
        [Required(ErrorMessage = "Employee ID is required for update.")]
        public int EmployeeId { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100)]
        public string Name { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        [StringLength(100)]
        public string Email { get; set; }

        [Required(ErrorMessage = "Phone is required.")]
        [Phone(ErrorMessage = "Invalid phone number format.")]
        [StringLength(20)]
        public string Phone { get; set; }

        [Required(ErrorMessage = "Hire Date is required.")]
        public DateOnly HireDate { get; set; }

        [Required(ErrorMessage = "Job ID is required.")]
        public int JobId { get; set; }

        [Required(ErrorMessage = "Department ID is required.")]
        public int DepartmentId { get; set; }

        [Required(ErrorMessage = "Employment Status is required.")]
        [StringLength(50)]
        public string EmploymentStatus { get; set; } // e.g., 'Full-Time', 'Probation'

    }
}