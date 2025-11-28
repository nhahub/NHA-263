using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    public class CandidateReadDto
    {
        public int CandidateID { get; set; }
        public string Status { get; set; }
        public int JobApplicationId { get; set; }
    }

    public class CandidateCreateDto
    {
        [Required(ErrorMessage = "Status is required.")]
        [StringLength(50)]
        public string Status { get; set; }

        [Required(ErrorMessage = "Job Application ID is required.")]
        public int JobApplicationId { get; set; }
    }

    public class CandidateUpdateDto
    {
        [Required(ErrorMessage = "Candidate ID is required.")]
        public int CandidateID { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(50)]
        public string Status { get; set; }

        [Required(ErrorMessage = "Job Application ID is required.")]
        public int JobApplicationId { get; set; }
    }
}



