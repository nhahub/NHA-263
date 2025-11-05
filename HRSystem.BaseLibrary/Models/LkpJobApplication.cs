using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("LkpJobApplication")]
public partial class LkpJobApplication
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int JobApplicationId { get; set; }

    public int JobID { get; set; }

    [Required]
    [StringLength(50)]
    public string Name { get; set; }

    [Required]
    [StringLength(50)]
    public string Email { get; set; }

    public int Phone { get; set; }

    [Required]
    [StringLength(100)]
    public string CVFile { get; set; }

    [Required]
    [StringLength(10)]
    public string Status { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime ApplyDate { get; set; }

    public int? CV_ID { get; set; }

    [ForeignKey("CV_ID")]
    [InverseProperty("LkpJobApplications")]
    public virtual TPLCVBank CV { get; set; }

    [InverseProperty("JobApplication")]
    public virtual ICollection<TPLCandidate> TPLCandidates { get; set; } = new List<TPLCandidate>();
}
