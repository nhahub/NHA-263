using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLRecruitmentPortal")]
public partial class TPLRecruitmentPortal
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int PortalID { get; set; }

    public int HRNeedID { get; set; }

    public DateOnly PublishDate { get; set; }

    public DateOnly ExpiryDate { get; set; }

    [StringLength(200)]
    public string Notes { get; set; }

    [ForeignKey("HRNeedID")]
    [InverseProperty("TPLRecruitmentPortals")]
    public virtual TPLHRNeedRequest HRNeed { get; set; }
}
