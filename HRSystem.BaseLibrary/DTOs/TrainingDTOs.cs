using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRSystem.BaseLibrary.DTOs
{
    public class TPLTrainingReadDTO
    {
        public int TrainingID { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int EmployeeID { get; set; }
        public int TrainerID { get; set; }
    }

    public class TPLTrainingCreateDTO
    {
        [Required]
        [StringLength(100)]
        public string Title { get; set; }

        public string Description { get; set; } 

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public int EmployeeID { get; set; }
        [Required]
        public int TrainerID { get; set; }
    }

    public class TPLTrainingUpdateDTO
    {
        [StringLength(100)]
        public string? Title { get; set; }

        public string? Description { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }
        public int? EmployeeID { get; set; }
        public int? TrainerID { get; set; }
    }
}
