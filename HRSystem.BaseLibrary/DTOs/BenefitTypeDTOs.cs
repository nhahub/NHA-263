using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    public class BenefitTypeReadDto
    {
        public int BenefitTypeID { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
    }

    public class BenefitTypeCreateDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(500)]
        public string Name { get; set; }

        public string Description { get; set; }

        public bool IsActive { get; set; } = true;
    }

    public class BenefitTypeUpdateDto
    {
        [Required(ErrorMessage = "Benefit Type ID is required.")]
        public int BenefitTypeID { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(500)]
        public string Name { get; set; }

        public string Description { get; set; }

        public bool IsActive { get; set; }
    }
}



