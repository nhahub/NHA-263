using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.Infrastructure.Implementations
{
    public class CompanyProfileRepository : GenericRepository<LkpGeneralDataCompanyProfile>, ICompanyProfileRepository
    {
        public CompanyProfileRepository(HRSystemContext context) : base(context)
        {
        }

        public async Task<IEnumerable<LkpGeneralDataCompanyProfile>> GetAllActiveAsync()
        {
            return await _dbSet.Where(x => !x.IsDeleted).ToListAsync();
        }

        public async Task<LkpGeneralDataCompanyProfile?> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.Name == name && !x.IsDeleted);
        }

        public override async Task<IEnumerable<LkpGeneralDataCompanyProfile>> GetAllAsync()
        {
            return await _dbSet.Include(x => x.LkpGeneralDataBranches).ToListAsync();
        }
    }
}

