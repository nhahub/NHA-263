// In HRSystem.Infrastructure/Implementations/TPLRequestRepository.cs
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using HRSystem.Infrastructure.Implementations;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

// TPLRequestRepository implements the ITPLRequestRepository contract
public class RequestRepository : GenericRepository<TPLRequest>, ITPLRequestRepository
{
    public RequestRepository(HRSystemContext context) : base(context)
    {
    }

    // Implementation of the overlap check
    public async Task<bool> HasConflictingRequestAsync(int employeeId, DateTime startDate, DateTime endDate)
    {
        // Check for any existing Approved or Pending requests for the employee
        return await _context.Set<TPLRequest>()
            .AnyAsync(r => r.employee_id == employeeId &&
                (r.status == "Approved" || r.status == "Pending") &&
                // Overlap condition: (Start1 <= End2) and (End1 >= Start2)
                (r.start_date <= endDate && r.end_date >= startDate));
    }

    // Implementation of the status update and logging the approver ID
    public async Task<bool> UpdateRequestStatusAsync(int requestId, string newStatus, int? approvedById)
    {
        var request = await _context.Set<TPLRequest>().FirstOrDefaultAsync(r => r.request_id == requestId);

        if (request == null)
        {
            return false;
        }

        request.status = newStatus;
        request.ApprovedBy = approvedById;

        await _context.SaveChangesAsync();

        return true;
    }

}