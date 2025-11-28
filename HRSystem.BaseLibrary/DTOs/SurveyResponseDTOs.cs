using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    public class SurveyResponseReadDto
    {
        public int ResponseID { get; set; }
        public int SurveyID { get; set; }
        public int EmployeeID { get; set; }
        public string ResponseText { get; set; }
        public int Rating { get; set; }
        public string SurveyTitle { get; set; }
    }

    public class SurveyResponseCreateDto
    {
        [Required(ErrorMessage = "Survey ID is required.")]
        public int SurveyID { get; set; }

        [Required(ErrorMessage = "Employee ID is required.")]
        public int EmployeeID { get; set; }

        public string ResponseText { get; set; }

        [Required(ErrorMessage = "Rating is required.")]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public int Rating { get; set; }
    }

    public class SurveyResponseUpdateDto
    {
        [Required(ErrorMessage = "Response ID is required.")]
        public int ResponseID { get; set; }

        [Required(ErrorMessage = "Survey ID is required.")]
        public int SurveyID { get; set; }

        [Required(ErrorMessage = "Employee ID is required.")]
        public int EmployeeID { get; set; }

        public string ResponseText { get; set; }

        [Required(ErrorMessage = "Rating is required.")]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public int Rating { get; set; }
    }
}



