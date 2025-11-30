using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLSurvey")]
public partial class TPLSurvey
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int SurveyID { get; set; }

    [Required]
    [StringLength(100)]
    public string Title { get; set; }

    public string Description { get; set; }

    public DateTime CreatedDate { get; set; }

    [InverseProperty("Survey")]
    public virtual ICollection<TPLSurvey_Response> TPLSurvey_Responses { get; set; } = new List<TPLSurvey_Response>();
}
