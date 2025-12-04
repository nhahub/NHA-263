using HRSystem.BaseLibrary.Models;
using System.Threading.Tasks;

namespace HRSystem.Infrastructure.Contracts
{
    public interface ITPLOnboardingRepository : IGenericRepository<TPLOnboarding>
    {
        // Logic: Check if the employee is already undergoing onboarding
        Task<bool> IsEmployeeOnboardingAsync(int employeeId);
    }
}