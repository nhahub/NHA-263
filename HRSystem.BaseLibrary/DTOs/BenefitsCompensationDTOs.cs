using System;
using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    public class BenefitsCompensationReadDto
    {
        public int BenefitID { get; set; }
        public int EmployeeID { get; set; }
        public int BenefitTypeID { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public decimal? Value { get; set; }
        public string BenefitTypeName { get; set; }
    }

    public class BenefitsCompensationCreateDto
    {
        [Required(ErrorMessage = "Employee ID is required.")]
        public int EmployeeID { get; set; }

        [Required(ErrorMessage = "Benefit Type ID is required.")]
        public int BenefitTypeID { get; set; }

        [Required(ErrorMessage = "Start Date is required.")]
        public DateOnly StartDate { get; set; }

        public DateOnly? EndDate { get; set; }

        public decimal? Value { get; set; }
    }

    public class BenefitsCompensationUpdateDto
    {
        [Required(ErrorMessage = "Benefit ID is required.")]
        public int BenefitID { get; set; }

        [Required(ErrorMessage = "Employee ID is required.")]
        public int EmployeeID { get; set; }

        [Required(ErrorMessage = "Benefit Type ID is required.")]
        public int BenefitTypeID { get; set; }

        [Required(ErrorMessage = "Start Date is required.")]
        public DateOnly StartDate { get; set; }

        public DateOnly? EndDate { get; set; }

        public decimal? Value { get; set; }
    }
}



