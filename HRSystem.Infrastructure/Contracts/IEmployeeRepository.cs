// In HRSystem.Infrastructure/Contracts/ITPLEmployeeRepository.cs
using HRSystem.BaseLibrary.Models;
using System.Threading.Tasks;

namespace HRSystem.Infrastructure.Contracts
{
    // Inherits from IGenericRepository for general Employee CRUD
    public interface ITPLEmployeeRepository : IGenericRepository<TPLEmployee>
    {
        // Logic for retrieving contact details required for notifications/emails
        Task<TPLEmployee> GetEmployeeContactInfoAsync(int employeeId);

        // ADD: Logic to check existence without tracking
        Task<TPLEmployee?> GetEmployeeExistenceByIdAsync(int employeeId);
    }
}