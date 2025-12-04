// DTOs for TPLLeave Entity (Leave Log)

using System;
using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    // DTO for Reading the approved and logged leaves (Output only)
    public class LeaveLogReadDto
    {
        // Primary Key
        public int LeaveId { get; set; }

        // Employee details (who took the leave)
        public int EmployeeId { get; set; }

        // Leave Type details
        public int LeaveTypeId { get; set; }
        public string LeaveTypeName { get; set; } // Added for display purposes

        // Duration and dates
        public int Quantity { get; set; } // Number of days taken
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        // Link to the request that generated this log entry
        public int RequestId { get; set; }
    }
}