using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

public partial class TPLHRNeedRequest
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int HRNeedID { get; set; }

    public int DepartmentId { get; set; }

    [Required]
    [StringLength(50)]
    public string Title { get; set; }

    public int Quantity { get; set; }

    public string Description { get; set; }

    [Required]
    [StringLength(20)]
    public string Status { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime CreatedDate { get; set; }

    [ForeignKey("DepartmentId")]
    [InverseProperty("TPLHRNeedRequests")]
    public virtual LkpHRDepartment Department { get; set; }

    [InverseProperty("HRNeed")]
    public virtual ICollection<TPLRecruitmentPortal> TPLRecruitmentPortals { get; set; } = new List<TPLRecruitmentPortal>();
}
