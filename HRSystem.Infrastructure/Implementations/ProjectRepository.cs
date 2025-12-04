// In HRSystem.Infrastructure/Implementations/TPLProjectRepository.cs
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using HRSystem.Infrastructure.Implementations;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

public class TPLProjectRepository : GenericRepository<TPLProject>, ITPLProjectRepository
{
    public TPLProjectRepository(HRSystemContext context) : base(context)
    {
    }

    // Logic: Check for a project with the same name before creation
    public async Task<TPLProject?> GetByNameAsync(string name)
    {
        // Assuming ProjectName is the correct property name in the TPLProject Entity
        return await _context.Set<TPLProject>()
            .FirstOrDefaultAsync(p => p.ProjectName == name);
    }
}