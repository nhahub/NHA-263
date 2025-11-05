using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLSurvey_Response")]
public partial class TPLSurvey_Response
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ResponseID { get; set; }

    public int SurveyID { get; set; }

    public int EmployeeID { get; set; }

    public string ResponseText { get; set; }

    public int Rating { get; set; }

    [ForeignKey("EmployeeID")]
    [InverseProperty("TPLSurvey_Responses")]
    public virtual TPLEmployee Employee { get; set; }

    [ForeignKey("SurveyID")]
    [InverseProperty("TPLSurvey_Responses")]
    public virtual TPLSurvey Survey { get; set; }
}
