using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLInterview")]
public partial class TPLInterview
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int InterviewID { get; set; }

    public int CandidateID { get; set; }

    public DateOnly Date { get; set; }

    [Required]
    [StringLength(50)]
    public string Result { get; set; }

    [Required]
    public string Description { get; set; }

    public int InterviewerID { get; set; }

    [ForeignKey("CandidateID")]
    [InverseProperty("TPLInterviews")]
    public virtual TPLCandidate Candidate { get; set; }

    [ForeignKey("InterviewerID")]
    [InverseProperty("TPLInterviews")]
    public virtual TPLEmployee Interviewer { get; set; }
}
