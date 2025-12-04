// In HRSystem.Infrastructure/Implementations/TPLEmployeeRepository.cs
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using HRSystem.Infrastructure.Implementations;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

public class TPLEmployeeRepository : GenericRepository<TPLEmployee>, ITPLEmployeeRepository
{
    public TPLEmployeeRepository(HRSystemContext context) : base(context)
    {
    }

    // Implementation to retrieve basic contact info
    public async Task<TPLEmployee> GetEmployeeContactInfoAsync(int employeeId)
    {
        // Select only the necessary columns (Name, Email, HireDate, JobID, etc.)
        return await _context.Set<TPLEmployee>()
            .AsNoTracking() // Use AsNoTracking since we are only reading data, not updating
            .FirstOrDefaultAsync(e => e.EmployeeID == employeeId);

    }

    public async Task<TPLEmployee?> GetEmployeeExistenceByIdAsync(int employeeId)
    {
        return await _context.Set<TPLEmployee>()
            .AsNoTracking() 
            .FirstOrDefaultAsync(e => e.EmployeeID == employeeId);
    }
}