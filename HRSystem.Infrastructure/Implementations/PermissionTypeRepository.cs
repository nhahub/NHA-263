// In HRSystem.Infrastructure/Implementations/LKPPermissionTypeRepository.cs
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using HRSystem.Infrastructure.Implementations;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

public class LKPPermissionTypeRepository : GenericRepository<LKPPermissionType>, IPermissionTypeRepository
{
    public LKPPermissionTypeRepository(HRSystemContext context) : base(context)
    {
    }

    // Retrieves rules (monthly limit, deductibility) by ID
    public async Task<LKPPermissionType?> GetPermissionRulesByIdAsync(int permissionTypeId)
    {
        return await _context.Set<LKPPermissionType>()
            .FirstOrDefaultAsync(t => t.permission_type_id == permissionTypeId);
    }

    // Retrieves permission type by name for validation (to prevent duplicates)
    public async Task<LKPPermissionType?> GetByNameAsync(string name)
    {
        return await _context.Set<LKPPermissionType>()
            .FirstOrDefaultAsync(t => t.permission_type_name == name);
    }
}