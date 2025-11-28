using System;
using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    public class DocumentManagementReadDto
    {
        public int DocumentID { get; set; }
        public int EmployeeID { get; set; }
        public string DocumentType { get; set; }
        public DateOnly UploadDate { get; set; }
        public DateOnly ExpiryDate { get; set; }
        public string FilePath { get; set; }
    }

    public class DocumentManagementCreateDto
    {
        [Required(ErrorMessage = "Employee ID is required.")]
        public int EmployeeID { get; set; }

        [Required(ErrorMessage = "Document Type is required.")]
        [StringLength(100)]
        public string DocumentType { get; set; }

        [Required(ErrorMessage = "Upload Date is required.")]
        public DateOnly UploadDate { get; set; }

        [Required(ErrorMessage = "Expiry Date is required.")]
        public DateOnly ExpiryDate { get; set; }

        [Required(ErrorMessage = "File Path is required.")]
        [StringLength(200)]
        public string FilePath { get; set; }
    }

    public class DocumentManagementUpdateDto
    {
        [Required(ErrorMessage = "Document ID is required.")]
        public int DocumentID { get; set; }

        [Required(ErrorMessage = "Employee ID is required.")]
        public int EmployeeID { get; set; }

        [Required(ErrorMessage = "Document Type is required.")]
        [StringLength(100)]
        public string DocumentType { get; set; }

        [Required(ErrorMessage = "Upload Date is required.")]
        public DateOnly UploadDate { get; set; }

        [Required(ErrorMessage = "Expiry Date is required.")]
        public DateOnly ExpiryDate { get; set; }

        [Required(ErrorMessage = "File Path is required.")]
        [StringLength(200)]
        public string FilePath { get; set; }
    }
}



