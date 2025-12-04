using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLTraining")]
public partial class TPLTraining
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int TrainingID { get; set; }

    [Required]
    [StringLength(100)]
    public string Title { get; set; }

    public string Description { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }
    public int EmployeeID { get; set; }  
    public int TrainerID { get; set; }

    [InverseProperty("Training")]
    public virtual ICollection<TPLEmployee_Training> TPLEmployee_Trainings { get; set; } = new List<TPLEmployee_Training>();
}
