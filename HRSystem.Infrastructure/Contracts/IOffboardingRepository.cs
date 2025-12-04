// In HRSystem.Infrastructure/Contracts/ITPLOffboardingRepository.cs
using HRSystem.BaseLibrary.Models;
using System.Threading.Tasks;

namespace HRSystem.Infrastructure.Contracts
{
    public interface ITPLOffboardingRepository : IGenericRepository<TPLOffboarding>
    {
        // Logic: Check if an offboarding record already exists for the employee (prevents duplicates)
        Task<TPLOffboarding?> GetOffboardingByEmployeeIdAsync(int employeeId);
    }
}