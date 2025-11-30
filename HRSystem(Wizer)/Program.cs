// To use the HRSystemContext class
using HRSystem.BaseLibrary;
using HRSystem.BaseLibrary.Profiles;
using HRSystem.Core.Services;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using HRSystem.Infrastructure.Implementations;
using HRSystem.Infrastructure.Implementations.Repositories;
using HRSystem.Infrastructure.Implementations.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;


namespace HRSystem_Wizer_
{

    public class Program
    {
        public static void Main(string[] args)
        {

            var builder = WebApplication.CreateBuilder(args);

            //injection of DB Context
            builder.Services.AddDbContext<HRSystemContext>(options =>
            {
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), sqlOptions =>
                {
                    sqlOptions.EnableRetryOnFailure();
                });
            });

            builder.Services.AddAutoMapper((typeof(HRMappingProfile).Assembly));

            // Register repositories
            builder.Services.AddScoped<ICompanyProfileRepository, CompanyProfileRepository>();
            builder.Services.AddScoped<IBranchRepository, BranchRepository>();
            builder.Services.AddScoped<IHRDepartmentRepository, HRDepartmentRepository>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<ITPLRequestRepository, RequestRepository>();
            builder.Services.AddScoped<ITPLLeaveBalanceRepository, TPLLeaveBalanceRepository>();
            builder.Services.AddScoped<ITPLLeaveRepository, TPLLeaveRepository>();
            builder.Services.AddScoped<ILKPLeaveTypeRepository, LKPLeaveTypeRepository>();
            builder.Services.AddScoped<ITPLEmployeeRepository, TPLEmployeeRepository>();
            builder.Services.AddScoped<ILeaveManagementService, LeaveManagementService>();
           
           // Register 16 entities' repositories for DI (already present or to be plugged in)
            builder.Services.AddScoped<ISelfServiceRequestRepository, SelfServiceRequestRepository>();
            builder.Services.AddScoped<IDocumentManagementRepository, DocumentManagementRepository>();
            builder.Services.AddScoped<IBenefitsCompensationRepository, BenefitsCompensationRepository>();
            builder.Services.AddScoped<IBenefitTypesRepository, BenefitTypesRepository>();
            builder.Services.AddScoped<ISalaryRepository, SalaryRepository>();
            builder.Services.AddScoped<IPerformanceEvaluationRepository, PerformanceEvaluationRepository>();
            builder.Services.AddScoped<IEvaluationCriteriaRepository, EvaluationCriteriaRepository>();
            builder.Services.AddScoped<ISurveyRepository, SurveyRepository>();
            builder.Services.AddScoped<ISurveyResponseRepository, SurveyResponseRepository>();
            builder.Services.AddScoped<IJobRepository, JobRepository>();
            builder.Services.AddScoped<IHRNeedRequestRepository, HRNeedRequestRepository>();
            builder.Services.AddScoped<IRecruitmentPortalRepository, RecruitmentPortalRepository>();
            builder.Services.AddScoped<ICVBankRepository, CVBankRepository>();
            builder.Services.AddScoped<IJobApplicationRepository, JobApplicationRepository>();
            builder.Services.AddScoped<ICandidateRepository, CandidateRepository>();
            builder.Services.AddScoped<IInterviewRepository, InterviewRepository>();
            
            // Add services to the container.
            builder.Services.AddControllers();

            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<ITokenService, TokenService>();
            
            // Register Generic Repository (works for all entity types)
            builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            
            // ---------------- JWT CONFIGURATION ----------------


            var jwtSettings = builder.Configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidAudience = jwtSettings["Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                };
            });

           

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "HRSystem API", Version = "v1" });

                // ????? ??? Bearer Token ?? Swagger UI
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "Enter 'Bearer' [space] and then your token.\n\nExample: Bearer abc123xyz",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
            });


                var app = builder.Build();
            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}