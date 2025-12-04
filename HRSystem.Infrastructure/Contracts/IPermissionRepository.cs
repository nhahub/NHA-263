using HRSystem.BaseLibrary.Models;
using System.Security;
using System.Threading.Tasks;

namespace HRSystem.Infrastructure.Contracts
{
    public interface IPermissionRepository : IGenericRepository<TPLPermission>
    {
        // 1. Check Overlap: To check that there is no other leave request (approved or pending) in the same time period
        Task<bool> HasOverlapAsync(int employeeId, DateTime startTime, DateTime endTime);

        // 2. Update Status: To update the order status by the manager
        Task<bool> UpdatePermissionStatusAsync(int permissionId, string newStatus, int? processedById);

        // 3. Get Used Hours: To calculate the total hours used monthly (to ensure compliance with the allowed limit)
        Task<decimal> GetEmployeeUsedHoursForMonth(int employeeId, int permissionTypeId, DateTime date);

    }
}
