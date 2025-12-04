// DTOs for TPLLeaveBalance Entity (Employee Leave Balances)

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace HRSystem.BaseLibrary.DTOs
{
    // =================================================================================
    // 1. READ DTO (OUTPUT): Current balance status
    // =================================================================================
    public class LeaveBalanceReadDto
    {
        public int BalanceId { get; set; }
        public int EmployeeId { get; set; }
        public int LeaveTypeId { get; set; }

        // This is the available balance: AllocatedDays - UsedDays
        public int AvailableBalance { get; set; }

        public int AllocatedDays { get; set; }
        public int UsedDays { get; set; }
        public short Year { get; set; }

        // Optional: Leave Type Name for display (Requires AutoMapper join)
        public string LeaveTypeName { get; set; }
    }

    // =================================================================================
    // 2. CREATE DTO (INPUT): Used to allocate initial balance (Manager action)
    // =================================================================================
    public class LeaveBalanceCreateDto
    {
        [Required(ErrorMessage = "Employee ID is required.")]
        public int EmployeeId { get; set; }

        [Required(ErrorMessage = "Leave Type ID is required.")]
        public int LeaveTypeId { get; set; }

        [Required(ErrorMessage = "Allocated Days must be specified.")]
        [Range(0, 365, ErrorMessage = "Allocation must be between 0 and 365 days.")]
        public int AllocatedDays { get; set; }

        // Used Days defaults to 0 upon creation (Handled in Service or DB)
        public short Year { get; set; }
    }

    // =================================================================================
    // 3. INTERNAL UPDATE DTO: Used ONLY by LeaveManagementService to change UsedDays
    // =================================================================================
    public class LeaveBalanceInternalUpdateDto
    {
        [Required]
        public int BalanceId { get; set; }

        [Required]
        public int UsedDays { get; set; }
    }
}
