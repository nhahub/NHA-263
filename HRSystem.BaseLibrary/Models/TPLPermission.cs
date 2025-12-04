using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

public partial class TPLPermission
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int permission_id { get; set; }

    public int employee_id { get; set; }

    public int permission_type_id { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime request_date { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime start_time { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? end_time { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? total_hours { get; set; }

    public string reason { get; set; }

    [Required]
    [StringLength(20)]
    public string status { get; set; }

    [ForeignKey("employee_id")]
    [InverseProperty("TPLPermissions")]
    public virtual TPLEmployee employee { get; set; }

    [ForeignKey("permission_type_id")]
    [InverseProperty("TPLPermissions")]
    public virtual LKPPermissionType permission_type { get; set; }
}
