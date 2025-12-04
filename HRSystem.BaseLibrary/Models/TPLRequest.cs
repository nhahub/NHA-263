using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

public partial class TPLRequest
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int request_id { get; set; }

    public int employee_id { get; set; }

    public int leave_type_id { get; set; }

    public DateTime start_date { get; set; }

    public DateTime end_date { get; set; }

    public int number_of_days { get; set; }

    [Required]
    [StringLength(70)]
    public string status { get; set; }

    public int? ApprovedBy { get; set; }

    [Column(TypeName = "DateTime")]
    public DateTime submission_date { get; set; }

    [InverseProperty("request")]
    public virtual TPLLeave TPLLeave { get; set; }

    [ForeignKey("employee_id")]
    [InverseProperty("TPLRequests")]
    public virtual TPLEmployee employee { get; set; }

    [ForeignKey("leave_type_id")]
    [InverseProperty("TPLRequests")]
    public virtual LKPLeaveType leave_type { get; set; }

    
}
