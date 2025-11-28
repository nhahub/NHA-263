using System;
using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    public class RecruitmentPortalReadDto
    {
        public int PortalID { get; set; }
        public int HRNeedID { get; set; }
        public DateOnly PublishDate { get; set; }
        public DateOnly ExpiryDate { get; set; }
        public string Notes { get; set; }
    }

    public class RecruitmentPortalCreateDto
    {
        [Required(ErrorMessage = "HR Need ID is required.")]
        public int HRNeedID { get; set; }

        [Required(ErrorMessage = "Publish Date is required.")]
        public DateOnly PublishDate { get; set; }

        [Required(ErrorMessage = "Expiry Date is required.")]
        public DateOnly ExpiryDate { get; set; }

        [StringLength(200)]
        public string Notes { get; set; }
    }

    public class RecruitmentPortalUpdateDto
    {
        [Required(ErrorMessage = "Portal ID is required.")]
        public int PortalID { get; set; }

        [Required(ErrorMessage = "HR Need ID is required.")]
        public int HRNeedID { get; set; }

        [Required(ErrorMessage = "Publish Date is required.")]
        public DateOnly PublishDate { get; set; }

        [Required(ErrorMessage = "Expiry Date is required.")]
        public DateOnly ExpiryDate { get; set; }

        [StringLength(200)]
        public string Notes { get; set; }
    }
}



