// In HRSystem.Infrastructure/Implementations/TPLOnboardingRepository.cs
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using HRSystem.Infrastructure.Implementations;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

public class TPLOnboardingRepository : GenericRepository<TPLOnboarding>, ITPLOnboardingRepository
{
    public TPLOnboardingRepository(HRSystemContext context) : base(context)
    {
    }

    // Implementation of the specific method to check for duplicate onboarding
    public async Task<bool> IsEmployeeOnboardingAsync(int employeeId)
    {
        // Assuming an employee should only have one active onboarding record.
        // We look for any existing record for this employee.
        return await _context.Set<TPLOnboarding>()
            .AnyAsync(o => o.EmployeeID == employeeId);
    }
}