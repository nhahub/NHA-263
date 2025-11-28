using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    public class EvaluationCriteriaReadDto
    {
        public int CriteriaID { get; set; }
        public string CriteriaName { get; set; }
        public string Description { get; set; }
        public decimal Weight { get; set; }
    }

    public class EvaluationCriteriaCreateDto
    {
        [Required(ErrorMessage = "Criteria Name is required.")]
        [StringLength(100)]
        public string CriteriaName { get; set; }

        [StringLength(100)]
        public string Description { get; set; }

        [Required(ErrorMessage = "Weight is required.")]
        [Range(0, 100, ErrorMessage = "Weight must be between 0 and 100.")]
        public decimal Weight { get; set; }
    }

    public class EvaluationCriteriaUpdateDto
    {
        [Required(ErrorMessage = "Criteria ID is required.")]
        public int CriteriaID { get; set; }

        [Required(ErrorMessage = "Criteria Name is required.")]
        [StringLength(100)]
        public string CriteriaName { get; set; }

        [StringLength(100)]
        public string Description { get; set; }

        [Required(ErrorMessage = "Weight is required.")]
        [Range(0, 100, ErrorMessage = "Weight must be between 0 and 100.")]
        public decimal Weight { get; set; }
    }
}



