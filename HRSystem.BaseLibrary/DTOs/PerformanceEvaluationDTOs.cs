using System;
using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    public class PerformanceEvaluationReadDto
    {
        public int EvaluationID { get; set; }
        public int EmployeeID { get; set; }
        public DateOnly Date { get; set; }
        public int Score { get; set; }
        public string Comments { get; set; }
        public int CriteriaID { get; set; }
        public string CriteriaName { get; set; }
    }

    public class PerformanceEvaluationCreateDto
    {
        [Required(ErrorMessage = "Employee ID is required.")]
        public int EmployeeID { get; set; }

        [Required(ErrorMessage = "Date is required.")]
        public DateOnly Date { get; set; }

        [Required(ErrorMessage = "Score is required.")]
        [Range(0, 100, ErrorMessage = "Score must be between 0 and 100.")]
        public int Score { get; set; }

        [Required(ErrorMessage = "Comments is required.")]
        public string Comments { get; set; }

        [Required(ErrorMessage = "Criteria ID is required.")]
        public int CriteriaID { get; set; }
    }

    public class PerformanceEvaluationUpdateDto
    {
        [Required(ErrorMessage = "Evaluation ID is required.")]
        public int EvaluationID { get; set; }

        [Required(ErrorMessage = "Employee ID is required.")]
        public int EmployeeID { get; set; }

        [Required(ErrorMessage = "Date is required.")]
        public DateOnly Date { get; set; }

        [Required(ErrorMessage = "Score is required.")]
        [Range(0, 100, ErrorMessage = "Score must be between 0 and 100.")]
        public int Score { get; set; }

        [Required(ErrorMessage = "Comments is required.")]
        public string Comments { get; set; }

        [Required(ErrorMessage = "Criteria ID is required.")]
        public int CriteriaID { get; set; }
    }
}



