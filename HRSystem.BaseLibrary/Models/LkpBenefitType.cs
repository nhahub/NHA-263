using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

public partial class LkpBenefitType
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int BenefitTypeID { get; set; }

    [Required]
    [StringLength(500)]
    public string Name { get; set; }

    public string Description { get; set; }

    public bool IsActive { get; set; }

    [InverseProperty("BenefitType")]
    public virtual ICollection<TPLBenefitsCompensation> TPLBenefitsCompensations { get; set; } = new List<TPLBenefitsCompensation>();
}
