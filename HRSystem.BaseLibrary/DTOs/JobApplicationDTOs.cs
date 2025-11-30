// DTOs for LkpJobApplication Entity

using System;
using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    // Read DTO (OUTPUT)
    public class JobApplicationReadDto
    {
        public int JobApplicationId { get; set; }
        public int JobID { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string CVFile { get; set; }
        public string Status { get; set; }
        public DateTime ApplyDate { get; set; }
        public int? CV_ID { get; set; }
    }

    // Create DTO (INPUT)
    public class JobApplicationCreateDto
    {
        [Required(ErrorMessage = "Job ID is required.")]
        public int JobID { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(50)]
        public string Name { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [StringLength(50)]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Phone is required.")]
        public string Phone { get; set; }

        [Required(ErrorMessage = "CV File is required.")]
        [StringLength(100)]
        public string CVFile { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(10)]
        public string Status { get; set; }

        [Required(ErrorMessage = "Apply Date is required.")]
        public DateTime ApplyDate { get; set; }

        public int? CV_ID { get; set; }
    }

    // Update DTO (INPUT)
    public class JobApplicationUpdateDto
    {
        [Required(ErrorMessage = "Job Application ID is required for update.")]
        public int JobApplicationId { get; set; }

        [Required(ErrorMessage = "Job ID is required.")]
        public int JobID { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(50)]
        public string Name { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [StringLength(50)]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Phone is required.")]
        public string Phone { get; set; }

        [Required(ErrorMessage = "CV File is required.")]
        [StringLength(100)]
        public string CVFile { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(10)]
        public string Status { get; set; }

        [Required(ErrorMessage = "Apply Date is required.")]
        public DateTime ApplyDate { get; set; }

        public int? CV_ID { get; set; }
    }
}




