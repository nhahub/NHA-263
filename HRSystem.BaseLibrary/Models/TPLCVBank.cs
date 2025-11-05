using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLCVBank")]
public partial class TPLCVBank
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int CV_ID { get; set; }

    [Required]
    [StringLength(100)]
    public string FullName { get; set; }

    [Required]
    [StringLength(100)]
    public string Email { get; set; }

    [Required]
    [StringLength(100)]
    public string PhoneNumber { get; set; }

    [Required]
    [StringLength(255)]
    public string CV_File { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime AddedDate { get; set; }

    [Required]
    [StringLength(200)]
    public string Notes { get; set; }

    [InverseProperty("CV")]
    public virtual ICollection<LkpJobApplication> LkpJobApplications { get; set; } = new List<LkpJobApplication>();
}
