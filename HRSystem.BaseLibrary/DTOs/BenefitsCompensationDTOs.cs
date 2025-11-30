// DTOs for TPLBenefitsCompensation Entity

using System;
using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    // Read DTO (OUTPUT)
    public class BenefitsCompensationReadDto
    {
        public int BenefitID { get; set; }
        public int EmployeeID { get; set; }
        public int BenefitTypeID { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? Value { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool isDeleted { get; set; }
    }

    // Create DTO (INPUT)
    public class BenefitsCompensationCreateDto
    {
        [Required(ErrorMessage = "Employee ID is required.")]
        public int EmployeeID { get; set; }

        [Required(ErrorMessage = "Benefit Type ID is required.")]
        public int BenefitTypeID { get; set; }

        [Required(ErrorMessage = "Start Date is required.")]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public decimal? Value { get; set; }

        public DateTime CreatedDate { get; set; }    // often set by backend
        public DateTime? UpdatedDate { get; set; }
        public bool isDeleted { get; set; }
    }

    // Update DTO (INPUT)
    public class BenefitsCompensationUpdateDto
    {
        [Required(ErrorMessage = "Benefit ID is required for update.")]
        public int BenefitID { get; set; }

        [Required(ErrorMessage = "Employee ID is required.")]
        public int EmployeeID { get; set; }

        [Required(ErrorMessage = "Benefit Type ID is required.")]
        public int BenefitTypeID { get; set; }

        [Required(ErrorMessage = "Start Date is required.")]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }
        public decimal? Value { get; set; }
        public DateTime CreatedDate { get; set; }    // often set by backend
        public DateTime? UpdatedDate { get; set; }
        public bool isDeleted { get; set; }
    }
}




