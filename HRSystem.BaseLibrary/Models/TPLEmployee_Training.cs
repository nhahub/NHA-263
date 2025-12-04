using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[PrimaryKey("EmployeeID", "TrainingID")]
[Table("TPLEmployee_Training")]
public partial class TPLEmployee_Training
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int EmployeeID { get; set; }

    [Key]
    public int TrainingID { get; set; }

    [Required]
    [StringLength(50)]
    public string CompletionStatus { get; set; }

    public int Score { get; set; }

    [ForeignKey("EmployeeID")]
    [InverseProperty("TPLEmployee_Trainings")]
    public virtual TPLEmployee Employee { get; set; }

    [ForeignKey("TrainingID")]
    [InverseProperty("TPLEmployee_Trainings")]
    public virtual TPLTraining Training { get; set; }
}
