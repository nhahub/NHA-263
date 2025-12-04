// In HRSystem.Infrastructure/Implementations/LKPLeaveTypeRepository.cs
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using HRSystem.Infrastructure.Implementations;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

public class LKPLeaveTypeRepository : GenericRepository<LKPLeaveType>, ILKPLeaveTypeRepository
{
    public LKPLeaveTypeRepository(HRSystemContext context) : base(context)
    {
    }

    // Implementation to retrieve the leave type rules by ID
    public async Task<LKPLeaveType> GetLeaveRulesByIdAsync(int leaveTypeId)
    {
        // Retrieve the leave type details including the rules (MaxDaysPerYear, IsDeductFromBalance, etc.)
        return await _context.Set<LKPLeaveType>()
            .FirstOrDefaultAsync(lt => lt.LeaveTypeId == leaveTypeId && lt.IsActive);
    }
}