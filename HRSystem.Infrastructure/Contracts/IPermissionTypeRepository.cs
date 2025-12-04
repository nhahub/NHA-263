using HRSystem.BaseLibrary.Models;
using System.Threading.Tasks;

namespace HRSystem.Infrastructure.Contracts
{
    public interface IPermissionTypeRepository : IGenericRepository<LKPPermissionType>
    {
        // 1. Get By Name: Retrieve by name (to ensure no duplicate leave type)
        Task<LKPPermissionType?> GetByNameAsync(string name);

        // 2. Get Rules: Retrieve the rules specific to the type of leave (maximum hours, whether deductions apply or not)
        Task<LKPPermissionType?> GetPermissionRulesByIdAsync(int permissionTypeId);


    }
}
