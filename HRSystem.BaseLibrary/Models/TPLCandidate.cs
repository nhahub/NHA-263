using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLCandidate")]
public partial class TPLCandidate
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int CandidateID { get; set; }

    [Required]
    [StringLength(50)]
    public string Status { get; set; }

    public int JobApplicationId { get; set; }

    [ForeignKey("JobApplicationId")]
    [InverseProperty("TPLCandidates")]
    public virtual LkpJobApplication JobApplication { get; set; }

    [InverseProperty("Candidate")]
    public virtual ICollection<TPLInterview> TPLInterviews { get; set; } = new List<TPLInterview>();
}
