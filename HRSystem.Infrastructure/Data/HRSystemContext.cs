using HRSystem.BaseLibrary.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;


namespace HRSystem.Infrastructure.Data;

public partial class HRSystemContext : DbContext
{
    public HRSystemContext()
    {
    }

    public HRSystemContext(DbContextOptions<HRSystemContext> options)
        : base(options)
    {
    }
    
    public virtual DbSet<LKPLeaveType> LKPLeaveTypes { get; set; }

    public virtual DbSet<LKPPermissionType> LKPPermissionTypes { get; set; }

    public virtual DbSet<LKPSalary> LKPSalaries { get; set; }

    public virtual DbSet<LkpBenefitType> LkpBenefitTypes { get; set; }

    public virtual DbSet<LkpGeneralDataBranch> LkpGeneralDataBranches { get; set; }

    public virtual DbSet<LkpGeneralDataCompanyProfile> LkpGeneralDataCompanyProfiles { get; set; }

    public virtual DbSet<LkpHRDepartment> LkpHRDepartments { get; set; }

    public virtual DbSet<LkpJobApplication> LkpJobApplications { get; set; }

    public virtual DbSet<TPLAssetManagement> TPLAssetManagements { get; set; }

    public virtual DbSet<TPLAttendance> TPLAttendances { get; set; }

    public virtual DbSet<TPLBenefitsCompensation> TPLBenefitsCompensations { get; set; }

    public virtual DbSet<TPLCVBank> TPLCVBanks { get; set; }

    public virtual DbSet<TPLCandidate> TPLCandidates { get; set; }

    public virtual DbSet<TPLDisciplinaryAction> TPLDisciplinaryActions { get; set; }

    public virtual DbSet<TPLDocumentManagement> TPLDocumentManagements { get; set; }

    public virtual DbSet<TPLEmployee> TPLEmployees { get; set; }

    public virtual DbSet<TPLEmployee_Training> TPLEmployee_Trainings { get; set; }

    public virtual DbSet<TPLEvaluationCriterion> TPLEvaluationCriteria { get; set; }

    public virtual DbSet<TPLHRNeedRequest> TPLHRNeedRequests { get; set; }

    public virtual DbSet<TPLInterview> TPLInterviews { get; set; }

    public virtual DbSet<TPLJob> TPLJobs { get; set; }

    public virtual DbSet<TPLLeave> TPLLeaves { get; set; }

    public virtual DbSet<TPLLeaveBalance> TPLLeaveBalances { get; set; }

    public virtual DbSet<TPLOffboarding> TPLOffboardings { get; set; }

    public virtual DbSet<TPLOnboarding> TPLOnboardings { get; set; }

    public virtual DbSet<TPLPerformanceEvaluation> TPLPerformanceEvaluations { get; set; }

    public virtual DbSet<TPLPermission> TPLPermissions { get; set; }

    public virtual DbSet<TPLProject> TPLProjects { get; set; }

    public virtual DbSet<TPLProject_Assignment> TPLProject_Assignments { get; set; }

    public virtual DbSet<TPLRecruitmentPortal> TPLRecruitmentPortals { get; set; }

    public virtual DbSet<TPLRequest> TPLRequests { get; set; }

    public virtual DbSet<TPLSelfServiceRequest> TPLSelfServiceRequests { get; set; }

    public virtual DbSet<TPLSurvey> TPLSurveys { get; set; }

    public virtual DbSet<TPLSurvey_Response> TPLSurvey_Responses { get; set; }

    public virtual DbSet<TPLTraining> TPLTrainings { get; set; }

    public virtual DbSet<TPLUser> TPLUsers { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }



    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<LKPLeaveType>(entity =>
        {
            entity.HasKey(e => e.LeaveTypeId).HasName("PK_LeaveTypes");
        });

        modelBuilder.Entity<LKPPermissionType>(entity =>
        {
            entity.Property(e => e.permission_type_id).ValueGeneratedOnAdd();
        });

        modelBuilder.Entity<LKPSalary>(entity =>
        {
            entity.HasKey(e => e.SalaryID).HasName("PK__LKPSalar__4BE204B719479BCC");

            entity.Property(e => e.SalaryID).ValueGeneratedOnAdd();

            entity.HasOne(d => d.Employee).WithMany(p => p.LKPSalaries)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_LKPSalary_TPLEmployee");
        });

        modelBuilder.Entity<LkpBenefitType>(entity =>
        {
            entity.Property(e => e.BenefitTypeID).ValueGeneratedOnAdd();
        });

        modelBuilder.Entity<LkpGeneralDataBranch>(entity =>
        {
            entity.Property(e => e.IsDeleted).HasAnnotation("Relational:DefaultConstraintName", "DF_LkpBranches_IsDeleted");

            entity.HasOne(d => d.Company).WithMany(p => p.LkpGeneralDataBranches)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_LkpGeneralDataBranches_LkpGeneralDataCompanyProfiles");
        });

        modelBuilder.Entity<LkpGeneralDataCompanyProfile>(entity =>
        {
            entity.Property(e => e.IsDeleted).HasAnnotation("Relational:DefaultConstraintName", "DF_LkpGeneralDataCompanyProfiles_IsDeleted");
        });

        modelBuilder.Entity<LkpHRDepartment>(entity =>
        {
            entity.HasKey(e => e.DepartmentId).HasName("PK_LkpDepartments");

            entity.Property(e => e.IsDeleted).HasAnnotation("Relational:DefaultConstraintName", "DF_LkpDepartments_IsDeleted");

            entity.HasOne(d => d.Branch).WithMany(p => p.LkpHRDepartments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_LkpHRDepartments_LkpGeneralDataBranches");
        });

        modelBuilder.Entity<LkpJobApplication>(entity =>
        {
            entity.Property(e => e.JobApplicationId).ValueGeneratedOnAdd();
            entity.Property(e => e.Email).IsFixedLength();

            entity.HasOne(d => d.CV).WithMany(p => p.LkpJobApplications).HasConstraintName("FK_LkpJobApplication_TPLCVBank");
        });

        modelBuilder.Entity<TPLAssetManagement>(entity =>
        {
            entity.HasKey(e => e.AssetID).HasName("PK__TPLAsset__434923721A60BBB8");

            entity.Property(e => e.AssetID).ValueGeneratedOnAdd();

            entity.HasOne(d => d.AssignedToNavigation).WithMany(p => p.TPLAssetManagements)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLAssetManagement_TPLEmployee");
        });

        modelBuilder.Entity<TPLAttendance>(entity =>
        {
            entity.HasKey(e => e.AttendanceID).HasName("PK__TPLAtten__8B69263C191476DC");

            entity.Property(e => e.AttendanceID).ValueGeneratedOnAdd();

            entity.HasOne(d => d.Employee).WithMany(p => p.TPLAttendances)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLAttendance_TPLEmployee");
        });

        modelBuilder.Entity<TPLBenefitsCompensation>(entity =>
        {
            entity.HasKey(e => e.BenefitID).HasName("PK__Benefits__5754C53AEB6B105B");

            entity.Property(e => e.BenefitID).ValueGeneratedOnAdd();

            entity.HasOne(d => d.BenefitType).WithMany(p => p.TPLBenefitsCompensations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLBenefitsCompensation_LkpBenefitTypes");

            entity.HasOne(d => d.Employee).WithMany(p => p.TPLBenefitsCompensations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLBenefitsCompensation_TPLEmployee");
        });

        modelBuilder.Entity<TPLCVBank>(entity =>
        {
            entity.Property(e => e.CV_ID).ValueGeneratedOnAdd();
        });

        modelBuilder.Entity<TPLCandidate>(entity =>
        {
            entity.HasKey(e => e.CandidateID).HasName("PK__TPLCandi__DF539BFC3A8F1883");

            entity.Property(e => e.CandidateID).ValueGeneratedOnAdd();

            entity.HasOne(d => d.JobApplication).WithMany(p => p.TPLCandidates)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLCandidate_LkpJobApplication");
        });

        modelBuilder.Entity<TPLDisciplinaryAction>(entity =>
        {
            entity.HasKey(e => e.ActionID).HasName("PK__TPLDisci__FFE3F4B90953BFED");

            entity.Property(e => e.ActionID).ValueGeneratedOnAdd();

            entity.HasOne(d => d.Employee).WithMany(p => p.TPLDisciplinaryActionEmployees)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLDisciplinaryActions_Employee1");

            entity.HasOne(d => d.TakenByNavigation).WithMany(p => p.TPLDisciplinaryActionTakenByNavigations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLDisciplinaryActions_Employee");
        });

        modelBuilder.Entity<TPLDocumentManagement>(entity =>
        {
            entity.HasKey(e => e.DocumentID).HasName("PK__TPLDocum__1ABEEF6F44C1B7DC");

            entity.Property(e => e.DocumentID).ValueGeneratedOnAdd();

            entity.HasOne(d => d.Employee).WithMany(p => p.TPLDocumentManagements)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLDocumentManagement_Employee");
        });

        modelBuilder.Entity<TPLEmployee>(entity =>
        {
            entity.HasKey(e => e.EmployeeID).HasName("PK__Employee__7AD04FF148254588");

            entity.Property(e => e.EmployeeID).ValueGeneratedOnAdd();

            entity.HasOne(d => d.Department).WithMany(p => p.TPLEmployees)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLEmployee_LkpHRDepartments");

            entity.HasOne(d => d.Job).WithMany(p => p.TPLEmployees)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLEmployee_Job");
        });

        modelBuilder.Entity<TPLEmployee_Training>(entity =>
        {
            entity.HasKey(e => new { e.EmployeeID, e.TrainingID }).HasName("PK__TPLEmplo__445D3E2F19C3B2EB");

            entity.HasOne(d => d.Employee).WithMany(p => p.TPLEmployee_Trainings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLEmployee_Training_TPLEmployee");

            entity.HasOne(d => d.Training).WithMany(p => p.TPLEmployee_Trainings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__TPLEmploy__Train__2180FB33");
        });

        modelBuilder.Entity<TPLEvaluationCriterion>(entity =>
        {
            entity.Property(e => e.CriteriaID).ValueGeneratedOnAdd();
        });

        modelBuilder.Entity<TPLHRNeedRequest>(entity =>
        {
            entity.HasKey(e => e.HRNeedID).HasName("PK_HRNeedRequests");

            entity.Property(e => e.HRNeedID).ValueGeneratedOnAdd();

            entity.HasOne(d => d.Department).WithMany(p => p.TPLHRNeedRequests)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLHRNeedRequests_LkpHRDepartments");
        });

        modelBuilder.Entity<TPLInterview>(entity =>
        {
            entity.HasKey(e => e.InterviewID).HasName("PK__Intervie__C97C5832B0092694");

            entity.Property(e => e.InterviewID).ValueGeneratedOnAdd();

            entity.HasOne(d => d.Candidate).WithMany(p => p.TPLInterviews)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLInterview_TPLCandidate");

            entity.HasOne(d => d.Interviewer).WithMany(p => p.TPLInterviews)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLInterview_TPLEmployee1");
        });

        modelBuilder.Entity<TPLJob>(entity =>
        {
            entity.HasKey(e => e.JobID).HasName("PK__TPLJob__056690E20F0CC5B9");

            entity.Property(e => e.JobID).ValueGeneratedOnAdd();
        });

        modelBuilder.Entity<TPLLeave>(entity =>
        {
            entity.HasKey(e => e.LeaveID).HasName("PK__Leave__796DB97974021ABD");

            entity.HasOne(d => d.request).WithOne(p => p.TPLLeave)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLLeave_TPLRequests");
        });

        modelBuilder.Entity<TPLLeaveBalance>(entity =>
        {
            entity.Property(e => e.BalanceId).ValueGeneratedOnAdd();

            entity.HasOne(d => d.Employee).WithMany(p => p.TPLLeaveBalances)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLLeaveBalance_TPLEmployee");
        });

        modelBuilder.Entity<TPLOffboarding>(entity =>
        {
            entity.HasKey(e => e.ExitID).HasName("PK__TPLOffbo__26D64E9808277847");

            entity.Property(e => e.ExitID).ValueGeneratedOnAdd();

            entity.HasOne(d => d.Employee).WithMany(p => p.TPLOffboardings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLOffboarding_TPLEmployee");
        });

        modelBuilder.Entity<TPLOnboarding>(entity =>
        {
            entity.HasKey(e => e.OnboardingID).HasName("PK__Onboardi__43F2371E2B631C75");

            entity.Property(e => e.OnboardingID).ValueGeneratedOnAdd();

            entity.HasOne(d => d.Employee).WithMany(p => p.TPLOnboardings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLOnboarding_TPLEmployee");
        });

        modelBuilder.Entity<TPLPerformanceEvaluation>(entity =>
        {
            entity.HasKey(e => e.EvaluationID).HasName("PK__TPLPerfo__36AE68D36D7296F8");

            entity.Property(e => e.EvaluationID).ValueGeneratedOnAdd();

            entity.HasOne(d => d.Criteria).WithMany(p => p.TPLPerformanceEvaluations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLPerformanceEvaluation_TPLEvaluationCriteria");

            entity.HasOne(d => d.Employee).WithMany(p => p.TPLPerformanceEvaluations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLPerformanceEvaluation_TPLEmployee2");
        });

        modelBuilder.Entity<TPLPermission>(entity =>
        {
            entity.Property(e => e.permission_id).ValueGeneratedOnAdd();

            entity.HasOne(d => d.employee).WithMany(p => p.TPLPermissions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLPermissions_TPLEmployee");

            entity.HasOne(d => d.permission_type).WithMany(p => p.TPLPermissions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLPermissions_LKPPermissionTypes");
        });

        modelBuilder.Entity<TPLProject>(entity =>
        {
            entity.HasKey(e => e.ProjectID).HasName("PK__TPLProje__761ABED0A98D3175");

            entity.Property(e => e.ProjectID).ValueGeneratedOnAdd();

            entity.HasOne(d => d.Manager).WithMany(p => p.TPLProjects).HasConstraintName("FK_TPLProject_Manager");
        });

        modelBuilder.Entity<TPLProject_Assignment>(entity =>
        {
            entity.Property(e => e.assignment_id).ValueGeneratedOnAdd();

            entity.HasOne(d => d.Employee).WithMany(p => p.TPLProject_Assignments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLProject_Assignment_TPLEmployee");

            entity.HasOne(d => d.Project).WithMany(p => p.TPLProject_Assignments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLProject_Assignment_TPLProject");
        });

        modelBuilder.Entity<TPLRecruitmentPortal>(entity =>
        {
            entity.HasKey(e => e.PortalID).HasName("PK__TPLRecru__B87D58338DAADC9C");

            entity.Property(e => e.PortalID).ValueGeneratedOnAdd();

            entity.HasOne(d => d.HRNeed).WithMany(p => p.TPLRecruitmentPortals)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLRecruitmentPortal_TPLHRNeedRequests");
        });

        modelBuilder.Entity<TPLRequest>(entity =>
        {
            entity.Property(e => e.request_id).ValueGeneratedOnAdd();

            entity.HasOne(d => d.employee).WithMany(p => p.TPLRequests)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLRequests_TPLEmployee");

            entity.HasOne(d => d.leave_type).WithMany(p => p.TPLRequests)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLRequests_LKPLeaveTypes");
        });

        modelBuilder.Entity<TPLSelfServiceRequest>(entity =>
        {
            entity.HasKey(e => e.RequestID).HasName("PK__TPLSelfS__33A8519A2AA9D005");

            entity.Property(e => e.RequestID).ValueGeneratedOnAdd();

            entity.HasOne(d => d.Employee).WithMany(p => p.TPLSelfServiceRequests)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLSelfServiceRequests_TPLEmployee");
        });

        modelBuilder.Entity<TPLSurvey>(entity =>
        {
            entity.HasKey(e => e.SurveyID).HasName("PK__TPLSurve__A5481F9D7B7BA7D2");

            entity.Property(e => e.SurveyID).ValueGeneratedOnAdd();
        });

        modelBuilder.Entity<TPLSurvey_Response>(entity =>
        {
            entity.HasKey(e => e.ResponseID).HasName("PK__TPLSurve__1AAA640CF9F8B7BF");

            entity.Property(e => e.ResponseID).ValueGeneratedOnAdd();

            entity.HasOne(d => d.Employee).WithMany(p => p.TPLSurvey_Responses)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLSurvey_Response_TPLEmployee");

            entity.HasOne(d => d.Survey).WithMany(p => p.TPLSurvey_Responses)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__TPLSurvey__Surve__31B762FC");
        });

        modelBuilder.Entity<TPLTraining>(entity =>
        {
            entity.HasKey(e => e.TrainingID).HasName("PK__TPLTrain__E8D71DE221E8C971");

            entity.Property(e => e.TrainingID).ValueGeneratedOnAdd();
        });

        modelBuilder.Entity<TPLUser>(entity =>
        {
            entity.HasKey(e => e.UserID).HasName("PK__User__1788CCAC2EB55247");

            entity.Property(e => e.UserID).ValueGeneratedOnAdd();

            entity.HasOne(d => d.Employee).WithOne(p => p.TPLUser)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TPLUser_TPLEmployee");
        });
        

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__RefreshT__3214EC07E7828848");
            entity.HasOne(r => r.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

