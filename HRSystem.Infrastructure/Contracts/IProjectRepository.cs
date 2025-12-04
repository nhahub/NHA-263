using HRSystem.BaseLibrary.Models;
using System.Threading.Tasks;

namespace HRSystem.Infrastructure.Contracts
{
    public interface ITPLProjectRepository : IGenericRepository<TPLProject>
    {
        Task<TPLProject?> GetByNameAsync(string name);
    }
}