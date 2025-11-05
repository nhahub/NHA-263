using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLOnboarding")]
public partial class TPLOnboarding
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int OnboardingID { get; set; }

    public int EmployeeID { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    [Required]
    [StringLength(100)]
    public string AssignedMentor { get; set; }

    [Required]
    [StringLength(50)]
    public string ChecklistStatus { get; set; }

    [ForeignKey("EmployeeID")]
    [InverseProperty("TPLOnboardings")]
    public virtual TPLEmployee Employee { get; set; }
}
