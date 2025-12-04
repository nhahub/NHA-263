// In HRSystem.Infrastructure/Contracts/ILKPLeaveTypeRepository.cs
using HRSystem.BaseLibrary.Models;
using System.Threading.Tasks;

namespace HRSystem.Infrastructure.Contracts
{
    // Inherits from IGenericRepository for basic CRUD on Leave Types
    public interface ILKPLeaveTypeRepository : IGenericRepository<LKPLeaveType>
    {
        // Logic for retrieving the rules required for leave validation
        // Returns the Leave Type data required by the Service Layer
        Task<LKPLeaveType> GetLeaveRulesByIdAsync(int leaveTypeId);
    }
}