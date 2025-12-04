using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRSystem.BaseLibrary.DTOs
{
    public class TPLOffboardingReadDTO
    {
        public int ExitID { get; set; }
        public int EmployeeID { get; set; }
        public DateTime ResignationDate { get; set; }
        public string ExitReason { get; set; }
        public string ClearanceStatus { get; set; }
        public string ExitInterviewNotes { get; set; }
    }

    public class TPLOffboardingCreateDTO
    {
        [Required]
        public int EmployeeID { get; set; }

        [Required]
        public DateTime ResignationDate { get; set; }

        [Required]
        [StringLength(200)]
        public string ExitReason { get; set; }

        
        [Required]
        [StringLength(50)]
        public string ClearanceStatus { get; set; }

        public string ExitInterviewNotes { get; set; }
    }

    public class TPLOffboardingUpdateDTO
    {
        public DateTime? ResignationDate { get; set; }

        [StringLength(200)]
        public string ExitReason { get; set; }

        [StringLength(50)]
        public string ClearanceStatus { get; set; } 

        public string ExitInterviewNotes { get; set; }
    }
}
