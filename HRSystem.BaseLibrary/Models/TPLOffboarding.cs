using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLOffboarding")]
public partial class TPLOffboarding
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ExitID { get; set; }

    public int EmployeeID { get; set; }

    public DateOnly ResignationDate { get; set; }

    [Required]
    [StringLength(200)]
    public string ExitReason { get; set; }

    [Required]
    [StringLength(50)]
    public string ClearanceStatus { get; set; }

    [Required]
    public string ExitInterviewNotes { get; set; }

    [ForeignKey("EmployeeID")]
    [InverseProperty("TPLOffboardings")]
    public virtual TPLEmployee Employee { get; set; }
}
