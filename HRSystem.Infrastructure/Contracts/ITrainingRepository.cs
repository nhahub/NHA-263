using HRSystem.BaseLibrary.Models;
using System.Threading.Tasks;

namespace HRSystem.Infrastructure.Contracts
{
    public interface ITPLTrainingRepository : IGenericRepository<TPLTraining>
    {
        // 1. Logic 2: Check for duplicate training titles before creation
        Task<TPLTraining?> GetByTitleAsync(string title);

        // 2. NEW LOGIC: Check if a specific employee is already assigned to a training with this title
        // This prevents the same employee from creating a duplicate training record.
        Task<TPLTraining?> IsEmployeeAssignedToTitleAsync(int employeeId, string title);

        // ADD: Logic to filter trainings by the assigned employee
        Task<IEnumerable<TPLTraining>> GetTrainingsByEmployeeIdAsync(int employeeId);
    }
}