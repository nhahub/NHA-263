// In HRSystem.Infrastructure/Contracts/ITPLLeaveBalanceRepository.cs
using HRSystem.BaseLibrary.Models;
using System.Threading.Tasks;

namespace HRSystem.Infrastructure.Contracts
{
    // Inherits from IGenericRepository for basic CRUD on balances
    public interface ITPLLeaveBalanceRepository : IGenericRepository<TPLLeaveBalance>
    {
        // 1. Logic for Step 2: Retrieve the current balance for validation
        // Returns the balance record for a specific employee, leave type, and current year
        Task<TPLLeaveBalance?> GetBalanceForValidationAsync(int employeeId, int leaveTypeId, short year);

        // 2. Logic for Step 4: Subtract the days from the balance upon approval
        // daysToSubtract should be a positive number
        Task<bool> SubtractUsedDaysAsync(int employeeId, int leaveTypeId, short year, int daysToSubtract);


    }
}