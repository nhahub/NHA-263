// In HRSystem.Core/Services/ILeaveManagementService.cs (or appropriate contracts folder)
using HRSystem.BaseLibrary.DTOs; // We use DTOs here to decouple from Entities
using System.Threading.Tasks;

namespace HRSystem.Core.Services
{
    public interface ILeaveManagementService
    {
        // Step 1 & 2: Employee submits a request. The service runs the automated checks.
        // Returns the final status of the request (e.g., "Pending Approval" or "Rejected - Insufficient Balance")
        Task<RequestReadDto> ProcessNewLeaveRequestAsync(LeaveRequestCreateDto requestDto);

        // Step 3 & 4: Manager action - Executes the final log and balance update.
        // The approvedById is the ID of the manager performing the action.
        Task<bool> ApproveLeaveRequestAsync(int requestId, int approvedById);

        // Step 3: Manager action - Simply updates the request status to Rejected.
        Task<bool> RejectLeaveRequestAsync(int requestId, int managerId);

        // Helper function required by the UI to check status
        Task<RequestReadDto> GetRequestByIdAsync(int requestId);
    }
}