using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

public partial class LkpHRDepartment
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int DepartmentId { get; set; }

    public int BranchId { get; set; }

    [Required]
    [StringLength(150)]
    public string NameEn { get; set; }

    [StringLength(150)]
    public string NameAr { get; set; }

    [StringLength(150)]
    public string Location { get; set; }

    [StringLength(500)]
    public string Description { get; set; }

    public int? ManagerId { get; set; }

    public int CreatedBy { get; set; }

    public bool IsDeleted { get; set; }

    [ForeignKey("BranchId")]
    [InverseProperty("LkpHRDepartments")]
    public virtual LkpGeneralDataBranch Branch { get; set; }

    [InverseProperty("Department")]
    public virtual ICollection<TPLEmployee> TPLEmployees { get; set; } = new List<TPLEmployee>();

    [InverseProperty("Department")]
    public virtual ICollection<TPLHRNeedRequest> TPLHRNeedRequests { get; set; } = new List<TPLHRNeedRequest>();
}
