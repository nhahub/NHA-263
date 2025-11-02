// To use the HRSystemContext class
using HRSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using HRSystem.BaseLibrary.Profiles;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Implementations;

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
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
            });

            builder.Services.AddAutoMapper((typeof(HRMappingProfile).Assembly));

            // Register repositories
            builder.Services.AddScoped<ICompanyProfileRepository, CompanyProfileRepository>();
            builder.Services.AddScoped<IBranchRepository, BranchRepository>();
            builder.Services.AddScoped<IHRDepartmentRepository, HRDepartmentRepository>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();

            // Add services to the container.
            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();


            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
