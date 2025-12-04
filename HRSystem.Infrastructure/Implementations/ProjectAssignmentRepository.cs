// In HRSystem.Infrastructure/Implementations/TPLProjectAssignmentRepository.cs
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using HRSystem.Infrastructure.Data;
using HRSystem.Infrastructure.Implementations;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

public class TPLProjectAssignmentRepository : GenericRepository<TPLProjectAssignment>, ITPLProjectAssignmentRepository
{
    public TPLProjectAssignmentRepository(HRSystemContext context) : base(context)
    {
    }

    // Logic: Check if the employee is already assigned to this specific project
    public async Task<bool> IsAssignedAsync(int employeeId, int projectId)
    {
        return await _context.Set<TPLProjectAssignment>()
            .AnyAsync(a => a.EmployeeID == employeeId && a.ProjectID == projectId);
    }

    // Reporting: Get all assignments for a specific project
    public async Task<IEnumerable<TPLProjectAssignment>> GetAssignmentsByProjectIdAsync(int projectId)
    {
        // Note: Using the correct table name TPLProject_Assignment
        return await _context.Set<TPLProjectAssignment>()
            .Where(a => a.ProjectID == projectId)
            .ToListAsync();
    }

    // =========================================================================
    // NEW: Get Assignments for the Current Employee (Self-Service Read)
    // =========================================================================
    public async Task<IEnumerable<TPLProjectAssignment>> GetMyAssignmentsAsync(int employeeId)
    {
        // Filters all records to show only those belonging to the given EmployeeID.
        return await _context.Set<TPLProjectAssignment>()
            .Where(a => a.EmployeeID == employeeId)
            .ToListAsync();
    }

    // [New Override - Required to fix the InvalidOperationException issue]
    public override async Task<TPLProjectAssignment?> GetByIdAsync(object id)
    {
        if (id is not int assignmentId)
        {
            return null;
        }

        return await _context.Set<TPLProjectAssignment>()
            .FirstOrDefaultAsync(a => a.assignment_id == assignmentId);
    }

    public async Task<IEnumerable<TPLProjectAssignment>> GetAssignmentsByEmployeeIdAsync(int employeeId)
    {
        // Filters all records to show only those belonging to the given EmployeeID.
        return await _context.Set<TPLProjectAssignment>()
            .Where(a => a.EmployeeID == employeeId)
            .ToListAsync();
    }
}