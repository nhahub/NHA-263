// In HRSystem.Infrastructure/Contracts/ITPLRequestRepository.cs
using HRSystem.BaseLibrary.Models;
using System;
using System.Threading.Tasks;

namespace HRSystem.Infrastructure.Contracts
{
    // Inherits from IGenericRepository for basic CRUD operations
    public interface ITPLRequestRepository : IGenericRepository<TPLRequest>
    {
        // Logic for checking overlap with existing requests (Important Logic)
        Task<bool> HasConflictingRequestAsync(int employeeId, DateTime startDate, DateTime endDate);

        // Logic for Step 3: Updating the request status (Approve/Reject)
        // approvedById is the ID of the manager/approver
        Task<bool> UpdateRequestStatusAsync(int requestId, string newStatus, int? approvedById);
    }
}