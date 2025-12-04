// DTOs for TPLRequests Entity (Central Request Log)

using System.ComponentModel.DataAnnotations;
namespace HRSystem.BaseLibrary.DTOs
{
    // =================================================================================
    // 1. READ DTO (OUTPUT): Data sent to the Frontend (GET Requests)
    // =================================================================================
    public class RequestReadDto
    {
        public int RequestId { get; set; }
        public int EmployeeId { get; set; }

        // This property will be populated by AutoMapper from the Navigation Property
        public string LeaveTypeName { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int NumberOfDays { get; set; }
        public string Status { get; set; } // Current Status (Pending, Approved, Rejected)
    }

    // =================================================================================
    // 2. CREATE DTO (INPUT): Used for submitting a new Leave Request
    // Note: EmployeeId is removed as it should be pulled from the Token (Security)
    // =================================================================================
    public class LeaveRequestCreateDto
    {
        // We keep EmployeeId here temporarily until we implement Controller logic 
        [Required(ErrorMessage = "Employee ID is required.")]
        public int EmployeeId { get; set; }

        [Required(ErrorMessage = "Leave Type ID is required.")]
        public int LeaveTypeId { get; set; }

        [Required(ErrorMessage = "Start Date is required.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "End Date is required.")]
        // Assuming DateGreaterThan is a custom validation attribute
        // [DateGreaterThan("StartDate", ErrorMessage = "End Date must be greater than or equal to Start Date.")] 
        public DateTime EndDate { get; set; }

        // We calculate NumberOfDays in the Business Service, not in the DTO

        [Required(ErrorMessage = "Leave reason/description is required.")]
        [StringLength(500)]
        public string Reason { get; set; }
    }

    // =================================================================================
    // 3. UPDATE DTO (INPUT): Used for updating an existing Leave Request (for Manager or Employee)
    // =================================================================================
    public class LeaveRequestUpdateDto : LeaveRequestCreateDto
    {
        [Required(ErrorMessage = "Request ID is required for update.")]
        public int RequestId { get; set; }

        // Manager uses this to update the status (e.g., from Pending to Approved)
        public string Status { get; set; }
    }
}