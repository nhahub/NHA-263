using HRSystem.BaseLibrary.Models;
using System.Threading.Tasks;

namespace HRSystem.Infrastructure.Contracts
{
    public interface ITPLAssetManagementRepository : IGenericRepository<TPLAssetManagement>
    {
        // 1. Logic: Check for unique serial number before creation
        Task<TPLAssetManagement?> GetBySerialNumberAsync(string serialNumber);

        // 2. Logic: Get asset currently assigned to a specific employee
        Task<IEnumerable<TPLAssetManagement>> GetAssetsByEmployeeIdAsync(int employeeId);
    }
}