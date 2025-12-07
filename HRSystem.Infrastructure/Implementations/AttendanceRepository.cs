// In HRSystem.Infrastructure/Implementations/TPLAttendanceRepository.cs
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using HRSystem.Infrastructure.Implementations;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class TPLAttendanceRepository : GenericRepository<TPLAttendance>, IAttendanceRepository
{
    public TPLAttendanceRepository(HRSystemContext context) : base(context)
    {
    }

    // Note: This method is unnecessary if you rely on the FK constraint later.
    public async Task<bool> AttendanceRecordExistsAsync(int employeeId, DateTime date)
    {
        return await _context.Set<TPLAttendance>()
            .AnyAsync(a => a.EmployeeID == employeeId && a.Date.Date == date.Date);
    }

    // في TPLAttendanceRepository.cs
    public async Task<TPLAttendance> GetTodayAttendanceRecordAsync(int employeeId, DateTime date)
    {
        var startOfDay = date.Date;
        var endOfToday = startOfDay.AddDays(1);
        return await _context.Set<TPLAttendance>()
            .FirstOrDefaultAsync(a =>
                a.EmployeeID == employeeId &&
                a.Date >= startOfDay &&
                a.Date < endOfToday &&
                a.CheckOut == null);        
    }

    // Retrieves the current day's record for a specific employee


    // Updates the CheckOut time for an existing record
    public async Task<bool> RecordCheckOutAsync(int attendanceId, TimeSpan checkOutTime, string status = "Present")
    {
        var record = await _context.Set<TPLAttendance>().FirstOrDefaultAsync(a => a.AttendanceID == attendanceId);

        if (record == null || record.CheckOut.HasValue)
        {
            return false;
        }

        record.CheckOut = checkOutTime;
        record.Status = status;

        await _context.SaveChangesAsync();
        return true;
    }

    // Fetches attendance records for reporting purposes
    public async Task<IEnumerable<TPLAttendance>> GetAttendanceByDateRangeAsync(int employeeId, DateTime startDate, DateTime endDate)
    {
        return await _context.Set<TPLAttendance>()
            .Where(a => a.EmployeeID == employeeId && a.Date >= startDate && a.Date <= endDate)
            .ToListAsync();
    }
}
