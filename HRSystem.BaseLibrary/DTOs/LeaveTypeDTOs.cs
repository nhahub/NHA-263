// DTOs for LKPLeaveType Entity (Managed by HR/Admin for CRUD operations)

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRSystem.BaseLibrary.DTOs
{
    // =================================================================================
    // 1. READ DTO (OUTPUT): Data sent to the Frontend
    // =================================================================================
    public class LeaveTypeReadDto
    {
        public int LeaveTypeId { get; set; }
        public string Name { get; set; }
        public bool IsPaid { get; set; }
        public bool RequiresMedicalNote { get; set; }
        public bool IsDeductFromBalance { get; set; }
        public int MaxDaysPerYear { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; } // Used for soft delete
    }

    // =================================================================================
    // 2. CREATE DTO (INPUT): Used to add a new Leave Type
    // =================================================================================
    public class LeaveTypeCreateDto
    {
        [Required(ErrorMessage = "Leave Type Name is required.")]
        [StringLength(50)]
        public string Name { get; set; }

        public bool IsPaid { get; set; } // Whether this leave is paid
        public bool RequiresMedicalNote { get; set; }

        [Required(ErrorMessage = "Deduction status is required.")]
        public bool IsDeductFromBalance { get; set; } // If it subtracts from TPLLeaveBalance

        [Required(ErrorMessage = "Max Days per year is required.")]
        public int MaxDaysPerYear { get; set; }

        [StringLength(1000)]
        public string Description { get; set; }

        public bool IsActive { get; set; } = true; // Default to active upon creation
    }

    // =================================================================================
    // 3. UPDATE DTO (INPUT): Used to modify an existing Leave Type
    // =================================================================================
    public class LeaveTypeUpdateDto : LeaveTypeCreateDto
    {
        [Required(ErrorMessage = "LeaveTypeId is required for update.")]
        public int LeaveTypeId { get; set; }

        public bool IsActive { get; set; } = true; // Default to active upon creation


        // Inherits all other rules from CreateDto
    }
}