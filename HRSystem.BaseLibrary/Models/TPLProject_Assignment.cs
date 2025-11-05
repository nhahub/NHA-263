using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLProject_Assignment")]
public partial class TPLProject_Assignment
{
    public int EmployeeID { get; set; }

    public int ProjectID { get; set; }

    [Required]
    [StringLength(100)]
    public string RoleInProject { get; set; }

    public int HoursWorked { get; set; }

    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int assignment_id { get; set; }

    [Required]
    [StringLength(10)]
    public string status { get; set; }

    [ForeignKey("EmployeeID")]
    [InverseProperty("TPLProject_Assignments")]
    public virtual TPLEmployee Employee { get; set; }

    [ForeignKey("ProjectID")]
    [InverseProperty("TPLProject_Assignments")]
    public virtual TPLProject Project { get; set; }
}
