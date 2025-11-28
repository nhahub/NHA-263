// DTOs for TPLSelfServiceRequest Entity

using System;
using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    // Read DTO (OUTPUT)
    public class SelfServiceRequestReadDto
    {
        public int RequestID { get; set; }
        public int EmployeeID { get; set; }
        public string RequestType { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; }
        public int? ApprovedBy { get; set; }
    }

    // Create DTO (INPUT)
    public class SelfServiceRequestCreateDto
    {
        [Required(ErrorMessage = "Employee ID is required.")]
        public int EmployeeID { get; set; }

        [Required(ErrorMessage = "Request Type is required.")]
        [StringLength(100)]
        public string RequestType { get; set; }

        [Required(ErrorMessage = "Request Date is required.")]
        public DateTime RequestDate { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(50)]
        public string Status { get; set; }

        public int? ApprovedBy { get; set; }
    }

    // Update DTO (INPUT)
    public class SelfServiceRequestUpdateDto
    {
        [Required(ErrorMessage = "Request ID is required for update.")]
        public int RequestID { get; set; }

        [Required(ErrorMessage = "Employee ID is required.")]
        public int EmployeeID { get; set; }

        [Required(ErrorMessage = "Request Type is required.")]
        [StringLength(100)]
        public string RequestType { get; set; }

        [Required(ErrorMessage = "Request Date is required.")]
        public DateTime RequestDate { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(50)]
        public string Status { get; set; }

        public int? ApprovedBy { get; set; }
    }
}
