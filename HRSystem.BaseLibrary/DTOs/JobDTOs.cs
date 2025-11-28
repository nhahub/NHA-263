using System;
using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    public class JobReadDto
    {
        public int JobID { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int DepartmentID { get; set; }
        public DateOnly PostedDate { get; set; }
        public string Status { get; set; }
    }

    public class JobCreateDto
    {
        [Required(ErrorMessage = "Title is required.")]
        [StringLength(100)]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required(ErrorMessage = "Department ID is required.")]
        public int DepartmentID { get; set; }

        [Required(ErrorMessage = "Posted Date is required.")]
        public DateOnly PostedDate { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(50)]
        public string Status { get; set; }
    }

    public class JobUpdateDto
    {
        [Required(ErrorMessage = "Job ID is required.")]
        public int JobID { get; set; }

        [Required(ErrorMessage = "Title is required.")]
        [StringLength(100)]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required(ErrorMessage = "Department ID is required.")]
        public int DepartmentID { get; set; }

        [Required(ErrorMessage = "Posted Date is required.")]
        public DateOnly PostedDate { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(50)]
        public string Status { get; set; }
    }
}



