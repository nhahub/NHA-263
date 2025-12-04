// In HRSystem.Infrastructure/Implementations/TPLLeaveRepository.cs
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using HRSystem.Infrastructure.Implementations;
using System;
using System.Threading.Tasks;

public class TPLLeaveRepository : GenericRepository<TPLLeave>, ITPLLeaveRepository
{
    public TPLLeaveRepository(HRSystemContext context) : base(context)
    {
    }

    // Implementation of logging the approved leave (Step 4)
    public async Task<TPLLeave> LogApprovedLeaveAsync(int employeeId, int leaveTypeId, int quantity, DateTime startDate, DateTime endDate, int requestId)
    {
        var newLeaveLog = new TPLLeave
        {
            EmployeeID = employeeId,
            LeaveTypeId = leaveTypeId,
            Quantity = quantity,
            StartDate = startDate,
            EndDate = endDate,
            request_id = requestId // Link to the original request
        };

        // Use the base AddAsync inherited from GenericRepository, or direct context:
        await _context.Set<TPLLeave>().AddAsync(newLeaveLog);
        await _context.SaveChangesAsync();

        return newLeaveLog;
    }
}