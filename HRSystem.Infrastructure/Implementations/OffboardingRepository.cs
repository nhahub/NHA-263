// In HRSystem.Infrastructure/Implementations/TPLOffboardingRepository.cs
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using HRSystem.Infrastructure.Implementations;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

public class TPLOffboardingRepository : GenericRepository<TPLOffboarding>, ITPLOffboardingRepository
{
    public TPLOffboardingRepository(HRSystemContext context) : base(context)
    {
    }

    // Logic: Check if an offboarding record already exists for the employee
    public async Task<TPLOffboarding?> GetOffboardingByEmployeeIdAsync(int employeeId)
    {
        // Typically, an employee should only have one offboarding record (or the latest one is relevant).
        // We check for any existing record.
        return await _context.Set<TPLOffboarding>()
            .FirstOrDefaultAsync(o => o.EmployeeID == employeeId);
    }
}