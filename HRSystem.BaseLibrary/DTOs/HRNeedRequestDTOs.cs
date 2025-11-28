using System;
using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    public class HRNeedRequestReadDto
    {
        public int HRNeedID { get; set; }
        public int DepartmentId { get; set; }
        public string Title { get; set; }
        public int Quantity { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class HRNeedRequestCreateDto
    {
        [Required(ErrorMessage = "Department ID is required.")]
        public int DepartmentId { get; set; }

        [Required(ErrorMessage = "Title is required.")]
        [StringLength(50)]
        public string Title { get; set; }

        [Required(ErrorMessage = "Quantity is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0.")]
        public int Quantity { get; set; }

        public string Description { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(20)]
        public string Status { get; set; }
    }

    public class HRNeedRequestUpdateDto
    {
        [Required(ErrorMessage = "HR Need ID is required.")]
        public int HRNeedID { get; set; }

        [Required(ErrorMessage = "Department ID is required.")]
        public int DepartmentId { get; set; }

        [Required(ErrorMessage = "Title is required.")]
        [StringLength(50)]
        public string Title { get; set; }

        [Required(ErrorMessage = "Quantity is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0.")]
        public int Quantity { get; set; }

        public string Description { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(20)]
        public string Status { get; set; }
    }
}



