using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using HRSystem.Infrastructure.Implementations;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class TPLAssetManagementRepository : GenericRepository<TPLAssetManagement>, ITPLAssetManagementRepository
{
    public TPLAssetManagementRepository(HRSystemContext context) : base(context)
    {
    }

    // Implementation: Check for unique serial number
    public async Task<TPLAssetManagement?> GetBySerialNumberAsync(string serialNumber)
    {
        return await _context.Set<TPLAssetManagement>()
            .FirstOrDefaultAsync(a => a.SerialNumber == serialNumber);
    }

    // Implementation: Get all assets assigned to an employee
    public async Task<IEnumerable<TPLAssetManagement>> GetAssetsByEmployeeIdAsync(int employeeId)
    {
        // Fetching assets where Status is not 'Returned'
        return await _context.Set<TPLAssetManagement>()
            .Where(a => a.AssignedTo == employeeId && a.Status != "Returned")
            .ToListAsync();
    }
}