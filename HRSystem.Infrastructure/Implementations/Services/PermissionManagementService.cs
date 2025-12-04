// In HRSystem.Infrastructure/Implementations/Services/PermissionManagementService.cs
using HRSystem.Infrastructure.Contracts;
using HRSystem.BaseLibrary.DTOs;
using HRSystem.BaseLibrary.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

public class PermissionManagementService : IPermissionManagementService
{
    private readonly IPermissionRepository _permissionRepo;
    private readonly IPermissionTypeRepository _permissionTypeRepo;
    private readonly ITPLEmployeeRepository _employeeRepo; // Injected for FK check

    public PermissionManagementService(
        IPermissionRepository permissionRepo,
        IPermissionTypeRepository permissionTypeRepo,
        ITPLEmployeeRepository employeeRepo)
    {
        _permissionRepo = permissionRepo;
        _permissionTypeRepo = permissionTypeRepo;
        _employeeRepo = employeeRepo;
    }

    // Helper function to calculate total duration in hours (decimal)
    private decimal CalculateTotalHours(DateTime startTime, DateTime? endTime)
    {
        if (!endTime.HasValue) return 0;

        // Use TimeSpan subtraction which is safe with DateTime
        TimeSpan duration = endTime.Value - startTime;
        return (decimal)duration.TotalHours;
    }

    // Helper function to get total used hours for the current month
    private async Task<decimal> GetEmployeeUsedHoursForMonth(int employeeId, int permissionTypeId, DateTime date)
    {
        // This delegates to the repository to calculate the sum of approved hours this month
        return await _permissionRepo.GetEmployeeUsedHoursForMonth(employeeId, permissionTypeId, date);
    }


    // =========================================================================
    // 1. Process New Permission Request (Automated Check)
    // =========================================================================
    public async Task<PermissionReadDto> ProcessNewPermissionRequestAsync(PermissionCreateDto dto)
    {
        // 🛑 1. FK Integrity Check: Ensure Employee ID exists before proceeding (Fixes Error 547)
        var submittingEmployee = await _employeeRepo.GetEmployeeExistenceByIdAsync(dto.EmployeeId);
        if (submittingEmployee == null)
        {
            throw new UnauthorizedAccessException($"Error: Employee ID {dto.EmployeeId} is not valid or not found in the system.");
        }

        decimal requestedHours = CalculateTotalHours(dto.StartTime, dto.EndTime);
        if (requestedHours <= 0)
        {
            throw new ArgumentException("Permission duration must be greater than zero.");
        }

        bool isConflicting = await _permissionRepo.HasOverlapAsync(dto.EmployeeId, dto.StartTime, dto.EndTime.Value);
        if (isConflicting)
        {
            throw new InvalidOperationException("This employee already has a conflicting permission.");
        }

        var typeRules = await _permissionTypeRepo.GetPermissionRulesByIdAsync(dto.PermissionTypeId);
        if (typeRules == null)
        {
            throw new ArgumentException("Invalid Permission Type ID.");
        }

        string initialStatus = "Pending";

        // --- START AUTOMATED MONTHLY LIMIT CHECK ---
        if (typeRules.is_deductible)
        {
            decimal usedHours = await GetEmployeeUsedHoursForMonth(dto.EmployeeId, dto.PermissionTypeId, dto.StartTime);
            decimal totalLimit = typeRules.monthly_limit_in_hours;

            if ((usedHours + requestedHours) > totalLimit)
            {
                initialStatus = "AutoRejected - Monthly Limit Exceeded";
            }
        }
        // --- END AUTOMATED CHECK ---

        // 4. Create the TPLPermission entity in the database
        var newPermissionEntity = new TPLPermission
        {
            employee_id = dto.EmployeeId,
            permission_type_id = dto.PermissionTypeId,
            start_time = dto.StartTime,
            end_time = dto.EndTime,
            total_hours = requestedHours,
            reason = dto.Reason,
            status = initialStatus,
            request_date = DateTime.Now
        };

        var createdEntity = await _permissionRepo.AddAsync(newPermissionEntity);

        if (createdEntity.status == "Pending")
        {
            // TODO: Notify Manager
        }

        // Return Read DTO (Manual Mapping)
        return new PermissionReadDto
        {
            PermissionId = createdEntity.permission_id,
            EmployeeId = createdEntity.employee_id,
            StartTime = createdEntity.start_time,
            EndTime = createdEntity.end_time,
            TotalHours = createdEntity.total_hours,
            Status = createdEntity.status,
            PermissionTypeName = typeRules.permission_type_name
        };
    }

    // ----------------------------------------------------------------------
    // 4. Get Permission Request by ID (For viewing details)
    // ----------------------------------------------------------------------
    public async Task<PermissionReadDto> GetPermissionRequestByIdAsync(int permissionId)
    {
        var permission = await _permissionRepo.GetByIdAsync(permissionId);
        if (permission == null) return null;

        var typeRules = await _permissionTypeRepo.GetPermissionRulesByIdAsync(permission.permission_type_id);

        return new PermissionReadDto
        {
            PermissionId = permission.permission_id,
            EmployeeId = permission.employee_id,
            StartTime = permission.start_time,
            EndTime = permission.end_time,
            TotalHours = permission.total_hours,
            Status = permission.status,
            PermissionTypeName = typeRules?.permission_type_name
        };
    }


    // ----------------------------------------------------------------------
    // 2. Approve Permission Request (Manager Action)
    // ----------------------------------------------------------------------
    public async Task<bool> ApprovePermissionRequestAsync(int permissionId, int approvedById)
    {
        var permission = await _permissionRepo.GetByIdAsync(permissionId);
        if (permission == null || permission.status != "Pending") return false;

        try
        {
            await _permissionRepo.UpdatePermissionStatusAsync(permissionId, "Approved", approvedById);

            // TODO: Notify the employee about the approval

            return true;
        }
        catch (Exception)
        {
            // Log the exception
            return false;
        }
    }

    // ----------------------------------------------------------------------
    // 3. Reject Permission Request (Manager Action)
    // ----------------------------------------------------------------------
    public async Task<bool> RejectPermissionRequestAsync(int permissionId, int managerId)
    {
        var permission = await _permissionRepo.GetByIdAsync(permissionId);
        if (permission == null || permission.status != "Pending") return false;

        bool success = await _permissionRepo.UpdatePermissionStatusAsync(permissionId, "Rejected", managerId);
        // TODO: Notify the employee about the rejection

        return success;
    }
}