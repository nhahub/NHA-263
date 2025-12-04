// In HRSystem.Infrastructure/Contracts/IPermissionManagementService.cs
using HRSystem.BaseLibrary.DTOs;
using System.Threading.Tasks;

namespace HRSystem.Infrastructure.Contracts
{
    // Contract for the Permission Management Business Logic
    public interface IPermissionManagementService
    {
        // 1. Employee Action: Process a new request (Auto-check limits, overlap)
        Task<PermissionReadDto> ProcessNewPermissionRequestAsync(PermissionCreateDto dto);

        // 2. Manager Action: Final approval
        Task<bool> ApprovePermissionRequestAsync(int permissionId, int approvedById);

        // 3. Manager Action: Final rejection
        Task<bool> RejectPermissionRequestAsync(int permissionId, int managerId);

        // 4. (Optional) Get request details for viewing
        Task<PermissionReadDto> GetPermissionRequestByIdAsync(int permissionId);
    }
}