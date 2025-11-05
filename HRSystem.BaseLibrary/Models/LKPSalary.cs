using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("LKPSalary")]
public partial class LKPSalary
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int SalaryID { get; set; }

    public int EmployeeID { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal BaseSalary { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal Bonus { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal Deductions { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal NetSalary { get; set; }

    public DateOnly PayDate { get; set; }

    [ForeignKey("EmployeeID")]
    [InverseProperty("LKPSalaries")]
    public virtual TPLEmployee Employee { get; set; }
}
