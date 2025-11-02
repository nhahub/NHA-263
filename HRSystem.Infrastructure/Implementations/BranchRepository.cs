using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.Infrastructure.Implementations
{
    public class BranchRepository : GenericRepository<LkpGeneralDataBranch>, IBranchRepository
    {
        public BranchRepository(HRSystemContext context) : base(context)
        {
        }

        public async Task<IEnumerable<LkpGeneralDataBranch>> GetByCompanyIdAsync(int companyId)
        {
            return await _dbSet.Where(x => x.CompanyId == companyId && !x.IsDeleted).ToListAsync();
        }

        public async Task<IEnumerable<LkpGeneralDataBranch>> GetAllActiveAsync()
        {
            return await _dbSet.Where(x => !x.IsDeleted).ToListAsync();
        }

        public async Task<LkpGeneralDataBranch?> GetByCodeAsync(string code)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.Code == code && !x.IsDeleted);
        }

        public override async Task<IEnumerable<LkpGeneralDataBranch>> GetAllAsync()
        {
            return await _dbSet.Include(x => x.Company).Include(x => x.LkpHRDepartments).ToListAsync();
        }
    }
}

