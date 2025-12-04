using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRSystem.BaseLibrary.DTOs
{
    // =========================================================================
    // READ DTO (OUTPUT)
    // =========================================================================
    public class TPLProjectAssignmentReadDTO
    {
        public int assignment_id { get; set; } // PK for reading
        public int EmployeeID { get; set; }
        public int ProjectID { get; set; }
        public string RoleInProject { get; set; }
        public int HoursWorked { get; set; }
        public string status { get; set; }
    }

    // =========================================================================
    // CREATE DTO (INPUT)
    // =========================================================================
    public class TPLProjectAssignmentCreateDTO
    {
        [Required]
        public int EmployeeID { get; set; }

        [Required]
        public int ProjectID { get; set; }

        [Required]
        [StringLength(100)]
        public string RoleInProject { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int HoursWorked { get; set; }

        [Required]
        [StringLength(10)]
        public string status { get; set; }
    }

    // =========================================================================
    // UPDATE DTO (INPUT)
    // =========================================================================
    public class TPLProjectAssignmentUpdateDTO
    {
        [Required(ErrorMessage = "Assignment ID is required for update.")]
        public int AssignmentID { get; set; }

        public int? EmployeeID { get; set; }
        public int? ProjectID { get; set; }

        [StringLength(100)]
        public string RoleInProject { get; set; }

        [Range(0, int.MaxValue)]
        public int? HoursWorked { get; set; }

        [StringLength(10)]
        public string status { get; set; }
    }
}