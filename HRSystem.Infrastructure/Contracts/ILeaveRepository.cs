// In HRSystem.Infrastructure/Contracts/ITPLLeaveRepository.cs
using HRSystem.BaseLibrary.Models;
using System.Threading.Tasks;

namespace HRSystem.Infrastructure.Contracts
{
    // Inherits from IGenericRepository for basic CRUD
    public interface ITPLLeaveRepository : IGenericRepository<TPLLeave>
    {
        // Logic for Step 4: Record the finalized leave in the log table
        Task<TPLLeave> LogApprovedLeaveAsync(int employeeId, int leaveTypeId, int quantity, DateTime startDate, DateTime endDate, int requestId);
    }
}