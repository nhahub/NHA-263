// File: HRSystem.BaseLibrary.DTOs (AttendanceCreateDto and supporting DTOs)

using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic; // Added for completeness

namespace HRSystem.BaseLibrary.DTOs
{
    /// <summary>
    /// DTO for reading attendance records (output).
    /// </summary>
    public class AttendanceReadDto
    {
        public int AttendanceID { get; set; }
        public int EmployeeID { get; set; }

        public string EmployeeName { get; set; }

        public DateTime Date { get; set; }
        public TimeSpan? CheckIn { get; set; }
        public TimeSpan? CheckOut { get; set; }
        public string Status { get; set; }
    }

    /// DTO for creating new attendance records. All fields are technically optional 
    /// as they are populated by the backend (safe design).
    public class AttendanceCreateDto
    {
        // These fields are populated by the Controller for security and data integrity.
        // They are kept here primarily for AutoMapper and Swashbuckle documentation,
        // but the Controller overrides them.
        public int? EmployeeID { get; set; }
        public DateTime? Date { get; set; }
        public TimeSpan? CheckIn { get; set; }
        public TimeSpan? CheckOut { get; set; }
        public string? Status { get; set; }
    }

    /// DTO for updating existing attendance records.
    public class TPLAttendanceUpdateDTO
    {
        public int? EmployeeID { get; set; }
        public DateTime? Date { get; set; }
        public TimeSpan? CheckIn { get; set; }
        public TimeSpan? CheckOut { get; set; }

        [StringLength(50, ErrorMessage = "Status cannot be longer than 50 characters.")]
        public string Status { get; set; }
    }
}
