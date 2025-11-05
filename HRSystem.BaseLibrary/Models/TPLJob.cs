using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLJob")]
public partial class TPLJob
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int JobID { get; set; }

    [Required]
    [StringLength(100)]
    public string Title { get; set; }

    public string Description { get; set; }

    public int DepartmentID { get; set; }

    public DateOnly PostedDate { get; set; }

    [Required]
    [StringLength(50)]
    public string Status { get; set; }

    [InverseProperty("Job")]
    public virtual ICollection<TPLEmployee> TPLEmployees { get; set; } = new List<TPLEmployee>();
}
