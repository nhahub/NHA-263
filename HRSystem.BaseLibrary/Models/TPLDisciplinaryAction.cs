using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

public partial class TPLDisciplinaryAction
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ActionID { get; set; }

    public int EmployeeID { get; set; }

    public DateOnly Date { get; set; }

    [Required]
    [StringLength(100)]
    public string ActionType { get; set; }

    [Required]
    public string Notes { get; set; }

    public int TakenBy { get; set; }

    [ForeignKey("EmployeeID")]
    [InverseProperty("TPLDisciplinaryActionEmployees")]
    public virtual TPLEmployee Employee { get; set; }

    [ForeignKey("TakenBy")]
    [InverseProperty("TPLDisciplinaryActionTakenByNavigations")]
    public virtual TPLEmployee TakenByNavigation { get; set; }
}
