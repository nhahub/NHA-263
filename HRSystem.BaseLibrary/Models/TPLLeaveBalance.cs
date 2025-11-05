using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLLeaveBalance")]
public partial class TPLLeaveBalance
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int BalanceId { get; set; }

    public int EmployeeId { get; set; }

    public int LeaveTypeId { get; set; }

    public int AllocatedDays { get; set; }

    public int UsedDays { get; set; }

    public short Year { get; set; }

    [ForeignKey("EmployeeId")]
    [InverseProperty("TPLLeaveBalances")]
    public virtual TPLEmployee Employee { get; set; }
}
