using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

public partial class LKPPermissionType
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int permission_type_id { get; set; }

    [Required]
    [StringLength(100)]
    public string permission_type_name { get; set; }

    public int monthly_limit_in_hours { get; set; }

    public bool is_deductible { get; set; }

    [InverseProperty("permission_type")]
    public virtual ICollection<TPLPermission> TPLPermissions { get; set; } = new List<TPLPermission>();
}
