using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLDocumentManagement")]
public partial class TPLDocumentManagement
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int DocumentID { get; set; }

    public int EmployeeID { get; set; }

    [Required]
    [StringLength(100)]
    public string DocumentType { get; set; }

    public DateOnly UploadDate { get; set; }

    public DateOnly ExpiryDate { get; set; }

    [Required]
    [StringLength(200)]
    public string FilePath { get; set; }

    [ForeignKey("EmployeeID")]
    [InverseProperty("TPLDocumentManagements")]
    public virtual TPLEmployee Employee { get; set; }
}
