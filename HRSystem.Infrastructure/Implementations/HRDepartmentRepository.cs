using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.Infrastructure.Implementations
{
    public class HRDepartmentRepository : GenericRepository<LkpHRDepartment>, IHRDepartmentRepository
    {
        public HRDepartmentRepository(HRSystemContext context) : base(context)
        {
        }

        public async Task<IEnumerable<LkpHRDepartment>> GetByBranchIdAsync(int branchId)
        {
            return await _dbSet.Where(x => x.BranchId == branchId && !x.IsDeleted).ToListAsync();
        }

        public async Task<IEnumerable<LkpHRDepartment>> GetAllActiveAsync()
        {
            return await _dbSet.Where(x => !x.IsDeleted).ToListAsync();
        }

        public async Task<LkpHRDepartment?> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.NameEn == name && !x.IsDeleted);
        }

        public override async Task<IEnumerable<LkpHRDepartment>> GetAllAsync()
        {
            return await _dbSet.Include(x => x.Branch).ThenInclude(x => x!.Company).ToListAsync();
        }
    }
}

