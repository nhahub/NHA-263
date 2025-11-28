using System;
using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    public class SalaryReadDto
    {
        public int SalaryID { get; set; }
        public int EmployeeID { get; set; }
        public decimal BaseSalary { get; set; }
        public decimal Bonus { get; set; }
        public decimal Deductions { get; set; }
        public decimal NetSalary { get; set; }
        public DateOnly PayDate { get; set; }
    }

    public class SalaryCreateDto
    {
        [Required(ErrorMessage = "Employee ID is required.")]
        public int EmployeeID { get; set; }

        [Required(ErrorMessage = "Base Salary is required.")]
        [Range(0, double.MaxValue, ErrorMessage = "Base Salary must be a positive number.")]
        public decimal BaseSalary { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Bonus must be a positive number.")]
        public decimal Bonus { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Deductions must be a positive number.")]
        public decimal Deductions { get; set; }

        [Required(ErrorMessage = "Pay Date is required.")]
        public DateOnly PayDate { get; set; }
    }

    public class SalaryUpdateDto
    {
        [Required(ErrorMessage = "Salary ID is required.")]
        public int SalaryID { get; set; }

        [Required(ErrorMessage = "Employee ID is required.")]
        public int EmployeeID { get; set; }

        [Required(ErrorMessage = "Base Salary is required.")]
        [Range(0, double.MaxValue, ErrorMessage = "Base Salary must be a positive number.")]
        public decimal BaseSalary { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Bonus must be a positive number.")]
        public decimal Bonus { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Deductions must be a positive number.")]
        public decimal Deductions { get; set; }

        [Required(ErrorMessage = "Pay Date is required.")]
        public DateOnly PayDate { get; set; }
    }
}



