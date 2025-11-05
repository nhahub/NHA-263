using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLProject")]
public partial class TPLProject
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ProjectID { get; set; }

    [Required]
    [StringLength(100)]
    public string ProjectName { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public int? ManagerID { get; set; }

    [ForeignKey("ManagerID")]
    [InverseProperty("TPLProjects")]
    public virtual TPLEmployee Manager { get; set; }

    [InverseProperty("Project")]
    public virtual ICollection<TPLProject_Assignment> TPLProject_Assignments { get; set; } = new List<TPLProject_Assignment>();
}
