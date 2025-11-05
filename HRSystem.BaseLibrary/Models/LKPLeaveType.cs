using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

public partial class LKPLeaveType
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int LeaveTypeId { get; set; }

    [Required]
    [StringLength(50)]
    public string Name { get; set; }

    public bool IsPaid { get; set; }

    public bool RequiresMedicalNote { get; set; }

    public bool IsDeductFromBalance { get; set; }

    public int MaxDaysPerYear { get; set; }

    [StringLength(1000)]
    public string Description { get; set; }

    public bool IsActive { get; set; }

    [InverseProperty("leave_type")]
    public virtual ICollection<TPLRequest> TPLRequests { get; set; } = new List<TPLRequest>();
}
