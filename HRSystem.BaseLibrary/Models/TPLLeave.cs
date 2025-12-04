using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLLeave")]
[Index("request_id", Name = "IX_Leave", IsUnique = true)]
public partial class TPLLeave
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int LeaveID { get; set; }

    public int EmployeeID { get; set; }

    public int LeaveTypeId { get; set; }

    public int Quantity { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public int request_id { get; set; }

    [ForeignKey("request_id")]
    [InverseProperty("TPLLeave")]
    public virtual TPLRequest request { get; set; }
}
