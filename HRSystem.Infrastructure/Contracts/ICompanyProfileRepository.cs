using System.Collections.Generic;
using System.Threading.Tasks;
using HRSystem.BaseLibrary.Models;

namespace HRSystem.Infrastructure.Contracts
{
    public interface ICompanyProfileRepository : IGenericRepository<LkpGeneralDataCompanyProfile>
    {
        Task<IEnumerable<LkpGeneralDataCompanyProfile>> GetAllActiveAsync();
        Task<LkpGeneralDataCompanyProfile?> GetByNameAsync(string name);
    }
}

