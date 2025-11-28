using System;
using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    public class SurveyReadDto
    {
        public int SurveyID { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateOnly CreatedDate { get; set; }
    }

    public class SurveyCreateDto
    {
        [Required(ErrorMessage = "Title is required.")]
        [StringLength(100)]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required(ErrorMessage = "Created Date is required.")]
        public DateOnly CreatedDate { get; set; }
    }

    public class SurveyUpdateDto
    {
        [Required(ErrorMessage = "Survey ID is required.")]
        public int SurveyID { get; set; }

        [Required(ErrorMessage = "Title is required.")]
        [StringLength(100)]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required(ErrorMessage = "Created Date is required.")]
        public DateOnly CreatedDate { get; set; }
    }
}



