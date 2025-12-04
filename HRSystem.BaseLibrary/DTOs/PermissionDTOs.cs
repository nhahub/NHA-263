using System;
using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    public class PermissionReadDto
    {
        public int PermissionId { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } // For display
        public string PermissionTypeName { get; set; } // For display
        public DateTime RequestDate { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public decimal? TotalHours { get; set; } // Calculated value
        public string Reason { get; set; }
        public string Status { get; set; } // Pending, Approved, Rejected
    }

    public class PermissionCreateDto
    {
        // EmployeeId will usually come from the JWT token
        [Required]
        public int EmployeeId { get; set; }

        [Required]
        public int PermissionTypeId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }
        [Required]
        // If EndTime is provided, TotalHours can be calculated.
        public DateTime? EndTime { get; set; }

        [StringLength(500)]
        public string Reason { get; set; }
    }

    public class TPLPermissionUpdateDTO
    {
        public int? employee_id { get; set; }

        public int? permission_type_id { get; set; }

        public DateTime? request_date { get; set; }

        public DateTime? start_time { get; set; }

        public DateTime? end_time { get; set; }

        [Range(0.01, 999.99)]
        public decimal? total_hours { get; set; }

        public string reason { get; set; }

        [StringLength(20)]
        public string status { get; set; }
    }
}
