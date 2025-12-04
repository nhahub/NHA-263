using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRSystem.BaseLibrary.DTOs
{
    public class TPLProjectReadDTO
    {
        public int ProjectID { get; set; }
        public string ProjectName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? ManagerID { get; set; }

        
    }
    public class TPLProjectCreateDTO
    {
        [Required]
        [StringLength(100)]
        public string ProjectName { get; set; }

        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime? EndDate { get; set; }
        [Required]
        public int? ManagerID { get; set; }
    }

    public class TPLProjectUpdateDTO
    {
        [StringLength(100)]
        public string ProjectName { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public int? ManagerID { get; set; }
    }
}
