using System.Threading.Tasks;
using HRSystem.BaseLibrary.Models;

namespace HRSystem.Infrastructure.Contracts
{
    public interface IUserRepository : IGenericRepository<TPLUser>
    {
        Task<TPLUser?> GetByUsernameAsync(string username);
        Task<TPLUser?> GetByEmployeeIdAsync(int employeeId);
        Task<bool> UserExistsAsync(string username);
    }
}

