using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.Infrastructure.Implementations
{
    public class UserRepository : GenericRepository<TPLUser>, IUserRepository
    {
        public UserRepository(HRSystemContext context) : base(context)
        {
        }

        public async Task<TPLUser?> GetByUsernameAsync(string username)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.Username == username);
        }

        public async Task<TPLUser?> GetByEmployeeIdAsync(int employeeId)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.EmployeeID == employeeId);
        }

        public async Task<bool> UserExistsAsync(string username)
        {
            return await _dbSet.AnyAsync(x => x.Username == username);
        }

        public override async Task<IEnumerable<TPLUser>> GetAllAsync()
        {
            return await _dbSet.Include(x => x.Employee).ToListAsync();
        }
    }
}

