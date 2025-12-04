using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLAssetManagement")]
public partial class TPLAssetManagement
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int AssetID { get; set; }

    [Required]
    [StringLength(100)]
    public string AssetName { get; set; }

    [Required]
    [StringLength(100)]
    public string SerialNumber { get; set; }

    public int AssignedTo { get; set; }

    public DateTime AssignedDate { get; set; }

    public DateTime? ReturnDate { get; set; }

    [Required]
    [StringLength(50)]
    public string Status { get; set; }

    [ForeignKey("AssignedTo")]
    [InverseProperty("TPLAssetManagements")]
    public virtual TPLEmployee AssignedToNavigation { get; set; }
}
