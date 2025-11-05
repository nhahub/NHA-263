using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

public partial class LkpGeneralDataBranch
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int BranchId { get; set; }

    public int CompanyId { get; set; }

    [Required]
    [StringLength(50)]
    public string Code { get; set; }

    [Required]
    [StringLength(150)]
    public string NameEn { get; set; }

    [StringLength(500)]
    public string Description { get; set; }

    public int CreatedBy { get; set; }

    public bool IsDeleted { get; set; }

    [ForeignKey("CompanyId")]
    [InverseProperty("LkpGeneralDataBranches")]
    public virtual LkpGeneralDataCompanyProfile Company { get; set; }

    [InverseProperty("Branch")]
    public virtual ICollection<LkpHRDepartment> LkpHRDepartments { get; set; } = new List<LkpHRDepartment>();
}
