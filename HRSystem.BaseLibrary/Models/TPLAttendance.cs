using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLAttendance")]
public partial class TPLAttendance
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int AttendanceID { get; set; }

    public int EmployeeID { get; set; }

    public DateOnly Date { get; set; }

    public TimeOnly? CheckIn { get; set; }

    public TimeOnly? CheckOut { get; set; }

    [Required]
    [StringLength(50)]
    public string Status { get; set; }

    [ForeignKey("EmployeeID")]
    [InverseProperty("TPLAttendances")]
    public virtual TPLEmployee Employee { get; set; }
}
