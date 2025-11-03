using System.Collections.Generic;
using System.Threading.Tasks;
using HRSystem.BaseLibrary.Models;

namespace HRSystem.Infrastructure.Contracts
{
    public interface IHRDepartmentRepository : IGenericRepository<LkpHRDepartment>
    {
        Task<IEnumerable<LkpHRDepartment>> GetByBranchIdAsync(int branchId);
        Task<IEnumerable<LkpHRDepartment>> GetAllActiveAsync();
        Task<LkpHRDepartment?> GetByNameAsync(string name);
    }
}
