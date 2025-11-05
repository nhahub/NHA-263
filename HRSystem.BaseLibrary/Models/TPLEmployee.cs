using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLEmployee")]
[Index("Email", Name = "UQ__Employee__A9D1053436BBDCA7", IsUnique = true)]
public partial class TPLEmployee
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int EmployeeID { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; }

    [Required]
    [StringLength(100)]
    public string Email { get; set; }

    [Required]
    [StringLength(20)]
    public string Phone { get; set; }

    public DateOnly HireDate { get; set; }

    public int JobID { get; set; }

    public int DepartmentID { get; set; }

    [Required]
    [StringLength(50)]
    public string EmploymentStatus { get; set; }

    [ForeignKey("DepartmentID")]
    [InverseProperty("TPLEmployees")]
    public virtual LkpHRDepartment Department { get; set; }

    [ForeignKey("JobID")]
    [InverseProperty("TPLEmployees")]
    public virtual TPLJob Job { get; set; }

    [InverseProperty("Employee")]
    public virtual ICollection<LKPSalary> LKPSalaries { get; set; } = new List<LKPSalary>();

    [InverseProperty("AssignedToNavigation")]
    public virtual ICollection<TPLAssetManagement> TPLAssetManagements { get; set; } = new List<TPLAssetManagement>();

    [InverseProperty("Employee")]
    public virtual ICollection<TPLAttendance> TPLAttendances { get; set; } = new List<TPLAttendance>();

    [InverseProperty("Employee")]
    public virtual ICollection<TPLBenefitsCompensation> TPLBenefitsCompensations { get; set; } = new List<TPLBenefitsCompensation>();

    [InverseProperty("Employee")]
    public virtual ICollection<TPLDisciplinaryAction> TPLDisciplinaryActionEmployees { get; set; } = new List<TPLDisciplinaryAction>();

    [InverseProperty("TakenByNavigation")]
    public virtual ICollection<TPLDisciplinaryAction> TPLDisciplinaryActionTakenByNavigations { get; set; } = new List<TPLDisciplinaryAction>();

    [InverseProperty("Employee")]
    public virtual ICollection<TPLDocumentManagement> TPLDocumentManagements { get; set; } = new List<TPLDocumentManagement>();

    [InverseProperty("Employee")]
    public virtual ICollection<TPLEmployee_Training> TPLEmployee_Trainings { get; set; } = new List<TPLEmployee_Training>();

    [InverseProperty("Interviewer")]
    public virtual ICollection<TPLInterview> TPLInterviews { get; set; } = new List<TPLInterview>();

    [InverseProperty("Employee")]
    public virtual ICollection<TPLLeaveBalance> TPLLeaveBalances { get; set; } = new List<TPLLeaveBalance>();

    [InverseProperty("Employee")]
    public virtual ICollection<TPLOffboarding> TPLOffboardings { get; set; } = new List<TPLOffboarding>();

    [InverseProperty("Employee")]
    public virtual ICollection<TPLOnboarding> TPLOnboardings { get; set; } = new List<TPLOnboarding>();

    [InverseProperty("Employee")]
    public virtual ICollection<TPLPerformanceEvaluation> TPLPerformanceEvaluations { get; set; } = new List<TPLPerformanceEvaluation>();

    [InverseProperty("employee")]
    public virtual ICollection<TPLPermission> TPLPermissions { get; set; } = new List<TPLPermission>();

    [InverseProperty("Employee")]
    public virtual ICollection<TPLProject_Assignment> TPLProject_Assignments { get; set; } = new List<TPLProject_Assignment>();

    [InverseProperty("Manager")]
    public virtual ICollection<TPLProject> TPLProjects { get; set; } = new List<TPLProject>();

    [InverseProperty("employee")]
    public virtual ICollection<TPLRequest> TPLRequests { get; set; } = new List<TPLRequest>();

    [InverseProperty("Employee")]
    public virtual ICollection<TPLSelfServiceRequest> TPLSelfServiceRequests { get; set; } = new List<TPLSelfServiceRequest>();

    [InverseProperty("Employee")]
    public virtual ICollection<TPLSurvey_Response> TPLSurvey_Responses { get; set; } = new List<TPLSurvey_Response>();

    [InverseProperty("Employee")]
    public virtual TPLUser TPLUser { get; set; }
}
