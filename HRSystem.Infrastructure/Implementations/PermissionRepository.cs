// In HRSystem.Infrastructure/Implementations/TPLPermissionRepository.cs
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using HRSystem.Infrastructure.Implementations;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class TPLPermissionRepository : GenericRepository<TPLPermission>, IPermissionRepository
{
    public TPLPermissionRepository(HRSystemContext context) : base(context)
    {
    }

    // Checks for time overlap with existing permissions (Approved/Pending)
    public async Task<bool> HasOverlapAsync(int employeeId, DateTime startTime, DateTime endTime)
    {
        return await _context.Set<TPLPermission>()
            .AnyAsync(p => p.employee_id == employeeId &&
                (p.status == "Approved" || p.status == "Pending") &&
                (p.start_time < endTime && p.end_time > startTime));
    }

    // Updates the status of the permission request
    public async Task<bool> UpdatePermissionStatusAsync(int permissionId, string newStatus, int? processedById)
    {
        var permission = await _context.Set<TPLPermission>().FirstOrDefaultAsync(p => p.permission_id == permissionId);

        if (permission == null) return false;

        permission.status = newStatus;
        // Assuming you might have a field for the processor ID
        // permission.ProcessedBy = processedById; 

        await _context.SaveChangesAsync();
        return true;
    }

    // Calculates the total approved hours used for a specific type in the current month
    public async Task<decimal> GetEmployeeUsedHoursForMonth(int employeeId, int permissionTypeId, DateTime date)
    {
        var startOfMonth = new DateTime(date.Year, date.Month, 1);
        var endOfMonth = startOfMonth.AddMonths(1).AddSeconds(-1);

        return await _context.Set<TPLPermission>()
            .Where(p => p.employee_id == employeeId &&
                        p.permission_type_id == permissionTypeId &&
                        p.status == "Approved" &&
                        p.request_date >= startOfMonth &&
                        p.request_date <= endOfMonth)
            .SumAsync(p => p.total_hours ?? 0);
    }
}