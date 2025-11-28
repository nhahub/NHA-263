using System;
using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    public class InterviewReadDto
    {
        public int InterviewID { get; set; }
        public int CandidateID { get; set; }
        public DateOnly Date { get; set; }
        public string Result { get; set; }
        public string Description { get; set; }
        public int InterviewerID { get; set; }
    }

    public class InterviewCreateDto
    {
        [Required(ErrorMessage = "Candidate ID is required.")]
        public int CandidateID { get; set; }

        [Required(ErrorMessage = "Date is required.")]
        public DateOnly Date { get; set; }

        [Required(ErrorMessage = "Result is required.")]
        [StringLength(50)]
        public string Result { get; set; }

        [Required(ErrorMessage = "Description is required.")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Interviewer ID is required.")]
        public int InterviewerID { get; set; }
    }

    public class InterviewUpdateDto
    {
        [Required(ErrorMessage = "Interview ID is required.")]
        public int InterviewID { get; set; }

        [Required(ErrorMessage = "Candidate ID is required.")]
        public int CandidateID { get; set; }

        [Required(ErrorMessage = "Date is required.")]
        public DateOnly Date { get; set; }

        [Required(ErrorMessage = "Result is required.")]
        [StringLength(50)]
        public string Result { get; set; }

        [Required(ErrorMessage = "Description is required.")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Interviewer ID is required.")]
        public int InterviewerID { get; set; }
    }
}



