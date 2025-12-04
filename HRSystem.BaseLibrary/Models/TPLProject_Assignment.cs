using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLProjectAssignment")]
public partial class TPLProjectAssignment
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int assignment_id { get; set; } 

    // Foreign Keys (EmployeeID and ProjectID are NOT identity columns)
    [Required]
    public int EmployeeID { get; set; }

    [Required]
    public int ProjectID { get; set; }

    // Data Fields
    [Required]
    [StringLength(100)]
    public string RoleInProject { get; set; }

    [Required]
    public int HoursWorked { get; set; }

    [Required]
    [StringLength(10)]
    public string Status { get; set; }

    // Navigation Properties
    [ForeignKey("EmployeeID")]
    [InverseProperty("TPLProject_Assignments")]
    public virtual TPLEmployee Employee { get; set; } = null!; // Assuming NOT NULL relation

    [ForeignKey("ProjectID")]
    public virtual TPLProject Project { get; set; } = null!; // Assuming NOT NULL relation
}