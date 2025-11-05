using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLPerformanceEvaluation")]
public partial class TPLPerformanceEvaluation
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int EvaluationID { get; set; }

    public int EmployeeID { get; set; }

    public DateOnly Date { get; set; }

    public int Score { get; set; }

    [Required]
    public string Comments { get; set; }

    public int CriteriaID { get; set; }

    [ForeignKey("CriteriaID")]
    [InverseProperty("TPLPerformanceEvaluations")]
    public virtual TPLEvaluationCriterion Criteria { get; set; }

    [ForeignKey("EmployeeID")]
    [InverseProperty("TPLPerformanceEvaluations")]
    public virtual TPLEmployee Employee { get; set; }
}
