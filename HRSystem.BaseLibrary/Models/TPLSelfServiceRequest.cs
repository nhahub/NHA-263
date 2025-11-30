using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

public partial class TPLSelfServiceRequest
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int RequestID { get; set; }

    public int EmployeeID { get; set; }

    [Required]
    [StringLength(100)]
    public string RequestType { get; set; }

    public DateTime RequestDate { get; set; }

    [Required]
    [StringLength(50)]
    public string Status { get; set; }

    public int? ApprovedBy { get; set; }

    [ForeignKey("EmployeeID")]
    [InverseProperty("TPLSelfServiceRequests")]
    public virtual TPLEmployee Employee { get; set; }
}
