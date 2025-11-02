using System.Collections.Generic;
using System.Threading.Tasks;
using HRSystem.BaseLibrary.Models;

namespace HRSystem.Infrastructure.Contracts
{
    public interface IBranchRepository : IGenericRepository<LkpGeneralDataBranch>
    {
        Task<IEnumerable<LkpGeneralDataBranch>> GetByCompanyIdAsync(int companyId);
        Task<IEnumerable<LkpGeneralDataBranch>> GetAllActiveAsync();
        Task<LkpGeneralDataBranch?> GetByCodeAsync(string code);
    }
}

