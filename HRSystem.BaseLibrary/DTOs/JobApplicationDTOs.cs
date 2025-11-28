using System;
using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    public class JobApplicationReadDto
    {
        public int JobApplicationId { get; set; }
        public int JobID { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public int Phone { get; set; }
        public string CVFile { get; set; }
        public string Status { get; set; }
        public DateTime ApplyDate { get; set; }
        public int? CV_ID { get; set; }
    }

    public class JobApplicationCreateDto
    {
        [Required(ErrorMessage = "Job ID is required.")]
        public int JobID { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(50)]
        public string Name { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        [StringLength(50)]
        public string Email { get; set; }

        [Required(ErrorMessage = "Phone is required.")]
        public int Phone { get; set; }

        [Required(ErrorMessage = "CV File is required.")]
        [StringLength(100)]
        public string CVFile { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(10)]
        public string Status { get; set; }

        public int? CV_ID { get; set; }
    }

    public class JobApplicationUpdateDto
    {
        [Required(ErrorMessage = "Job Application ID is required.")]
        public int JobApplicationId { get; set; }

        [Required(ErrorMessage = "Job ID is required.")]
        public int JobID { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(50)]
        public string Name { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        [StringLength(50)]
        public string Email { get; set; }

        [Required(ErrorMessage = "Phone is required.")]
        public int Phone { get; set; }

        [Required(ErrorMessage = "CV File is required.")]
        [StringLength(100)]
        public string CVFile { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(10)]
        public string Status { get; set; }

        public int? CV_ID { get; set; }
    }
}



