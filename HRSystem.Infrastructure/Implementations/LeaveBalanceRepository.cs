// In HRSystem.Infrastructure/Implementations/TPLLeaveBalanceRepository.cs
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using HRSystem.Infrastructure.Implementations;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

public class TPLLeaveBalanceRepository : GenericRepository<TPLLeaveBalance>, ITPLLeaveBalanceRepository
{
    public TPLLeaveBalanceRepository(HRSystemContext context) : base(context)
    {
    }

    // Implementation of balance retrieval for validation
    public async Task<TPLLeaveBalance?> GetBalanceForValidationAsync(int employeeId, int leaveTypeId, short year)
    {
        return await _context.Set<TPLLeaveBalance>()
            .FirstOrDefaultAsync(b =>
                b.EmployeeId == employeeId &&
                b.LeaveTypeId == leaveTypeId &&
                b.Year == year);
    }

    



    // Implementation of subtracting used days (Step 4)
    public async Task<bool> SubtractUsedDaysAsync(int employeeId, int leaveTypeId, short year, int daysToSubtract)
    {
        // 1. Retrieve the existing balance record for the current year/type.
        var balance = await GetBalanceForValidationAsync(employeeId, leaveTypeId, year);

        // 2. PRIMARY CHECK: Ensure the record exists (e.g., balance was allocated).
        if (balance == null)
        {
            return false;
        }

        // 3. DEFENSIVE CHECK: Prevent saving a negative balance (Logic validation).
        // Check if the current available days are less than the days being subtracted.
        if ((balance.AllocatedDays - balance.UsedDays) < daysToSubtract)
        {
            // Logic error in the Service Layer, prevent data corruption.
            return false;
        }

        // 4. APPLY UPDATE: Subtract the approved days from the used days count.
        balance.UsedDays += daysToSubtract;

        // 5. Save changes to the database.
        await _context.SaveChangesAsync();

        return true;
    }
}
