using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRSystem.BaseLibrary.DTOs
{
    public class TPLOnboardingReadDTO
    {
        public int OnboardingID { get; set; }
        public int EmployeeID { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string AssignedMentor { get; set; }
        public string ChecklistStatus { get; set; }
    }

    public class TPLOnboardingCreateDTO
    {
        [Required]
        public int EmployeeID { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        [StringLength(100)]
        public string AssignedMentor { get; set; }

        [Required]
        [StringLength(50)]
        public string ChecklistStatus { get; set; }
    }

    public class TPLOnboardingUpdateDTO
    {
        public int? EmployeeID { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [StringLength(100)]
        public string AssignedMentor { get; set; } 

        [StringLength(50)]
        public string ChecklistStatus { get; set; } 
    }
}
