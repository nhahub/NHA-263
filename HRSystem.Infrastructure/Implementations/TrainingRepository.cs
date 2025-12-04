// In HRSystem.Infrastructure/Implementations/TPLTrainingRepository.cs
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using HRSystem.Infrastructure.Implementations;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

public class TPLTrainingRepository : GenericRepository<TPLTraining>, ITPLTrainingRepository
{
    public TPLTrainingRepository(HRSystemContext context) : base(context)
    {
    }

    // Implementation of the specific method to check for duplicate training title
    public async Task<TPLTraining?> GetByTitleAsync(string title)
    {
        return await _context.Set<TPLTraining>()
            .FirstOrDefaultAsync(t => t.Title == title);
    }

    public async Task<TPLTraining?> IsEmployeeAssignedToTitleAsync(int employeeId, string title)
    {
        // Logic: Find any record where the EmployeeID matches AND the Title matches.
        return await _context.Set<TPLTraining>()
            .FirstOrDefaultAsync(t => t.EmployeeID == employeeId && t.Title == title);
    }

    public async Task<IEnumerable<TPLTraining>> GetTrainingsByEmployeeIdAsync(int employeeId)
    {
        return await _context.Set<TPLTraining>()
            .Where(t => t.EmployeeID == employeeId)
            .ToListAsync();
    }
}