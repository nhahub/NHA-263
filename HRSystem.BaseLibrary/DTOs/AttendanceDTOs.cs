using System;
using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    public class AttendanceReadDto
    {
        public int AttendanceID { get; set; }
        public int EmployeeID { get; set; }

        // This should be mapped from a navigation property (if Employee entity has a Name field)
        public string EmployeeName { get; set; }

        public DateTime Date { get; set; }
        public DateTime? CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public string Status { get; set; } // e.g., Present, Absent, Holiday, On Leave
    }

    public class AttendanceCreateDto
    {
        [Required]
        public int EmployeeID { get; set; }

        [Required]
        public DateTime Date { get; set; }

        // Note: CheckIn and CheckOut are often handled by a system clock, but included for manual entry
        public DateTime? CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }

        [Required(ErrorMessage = "Check-In Latitude is required.")]
        public decimal? CheckInLatitude { get; set; }

        [Required(ErrorMessage = "Check-In Longitude is required.")]
        public decimal? CheckInLongitude { get; set; }

        [Required, StringLength(50)]
        public string Status { get; set; }
    }

    public class TPLAttendanceUpdateDTO
    {

        public int? EmployeeID { get; set; }

        public DateTime? Date { get; set; }

        public DateTime? CheckIn { get; set; }

        public DateTime? CheckOut { get; set; }

        [StringLength(50, ErrorMessage = "Status cannot be longer than 50 characters.")]
        public string Status { get; set; }
    }
}