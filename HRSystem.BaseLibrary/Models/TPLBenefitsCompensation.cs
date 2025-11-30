using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLBenefitsCompensation")]
public partial class TPLBenefitsCompensation
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int BenefitID { get; set; }

    public int EmployeeID { get; set; }

    public int BenefitTypeID { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal? Value { get; set; }

    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
    public bool isDeleted { get; set; }

    [ForeignKey("BenefitTypeID")]
    [InverseProperty("TPLBenefitsCompensations")]
    public virtual LkpBenefitType BenefitType { get; set; }

    [ForeignKey("EmployeeID")]
    [InverseProperty("TPLBenefitsCompensations")]
    public virtual TPLEmployee Employee { get; set; }
}
