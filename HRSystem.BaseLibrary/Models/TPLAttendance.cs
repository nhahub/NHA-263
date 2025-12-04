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

    public DateTime Date { get; set; }

    public DateTime? CheckIn { get; set; }

    public DateTime? CheckOut { get; set; }

    // --- ADDING NEW COLUMNS FOR GEO-FENCING ---
    [Column(TypeName = "decimal(10, 8)")] // Precision for coordinates
    public decimal? CheckInLatitude { get; set; }

    [Column(TypeName = "decimal(10, 8)")]
    public decimal? CheckInLongitude { get; set; }

    [Required]
    [StringLength(50)]
    public string Status { get; set; }

    [ForeignKey("EmployeeID")]
    [InverseProperty("TPLAttendances")]
    public virtual TPLEmployee Employee { get; set; }
}
