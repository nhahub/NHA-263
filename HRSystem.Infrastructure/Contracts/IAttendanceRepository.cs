using HRSystem.BaseLibrary.Models;
using System.Threading.Tasks;

namespace HRSystem.Infrastructure.Contracts
{
    public interface IAttendanceRepository : IGenericRepository<TPLAttendance>
    {
        // 1. Get today's log: Record attendance for the current day (to check entry/exit status)
        Task<TPLAttendance?> GetTodayAttendanceRecordAsync(int employeeId, DateTime date);

        // 2. Check-Out: Update check-out time and hours
        // We use AttendanceID to specify the record to be updated
        Task<bool> RecordCheckOutAsync(int attendanceId, DateTime checkOutTime, string status = "Present");

        // 3. Reporting/Validation: Retrieve attendance records for an employee within a specific time range.
        Task<IEnumerable<TPLAttendance>> GetAttendanceByDateRangeAsync(int employeeId, DateTime startDate, DateTime endDate);

    }
}
