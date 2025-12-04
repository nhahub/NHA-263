// In HRSystem.Infrastructure/Implementations/Services/LeaveManagementService.cs
using HRSystem.Core.Services; // Assuming the interface is here
using HRSystem.BaseLibrary.DTOs;
using HRSystem.Infrastructure.Contracts;
using HRSystem.BaseLibrary.Models;
using System;
using System.Threading.Tasks;

public class LeaveManagementService : ILeaveManagementService
{


    // Inject all required Repositories
    private readonly ITPLRequestRepository _requestRepo;
    private readonly ITPLLeaveBalanceRepository _balanceRepo;
    private readonly ITPLEmployeeRepository _employeeRepo;
    private readonly ILKPLeaveTypeRepository _leaveTypeRepo;
    private readonly ITPLLeaveRepository _leaveLogRepo; // Added for Step 4c

    // The constructor injects all dependencies
    public LeaveManagementService(
        ITPLRequestRepository requestRepo,
        ITPLLeaveBalanceRepository balanceRepo,
        ITPLEmployeeRepository employeeRepo,
        ILKPLeaveTypeRepository leaveTypeRepo,
        ITPLLeaveRepository leaveLogRepo) // Added ITPLLeaveRepository
    {
        _requestRepo = requestRepo;
        _balanceRepo = balanceRepo;
        _employeeRepo = employeeRepo;
        _leaveTypeRepo = leaveTypeRepo;
        _leaveLogRepo = leaveLogRepo;
    }

    // Helper function to calculate working days (Excludes Friday and Saturday)
    private int CalculateWorkingDays(DateTime startDate, DateTime endDate)
    {
        if (startDate.Date > endDate.Date)
        {
            throw new ArgumentException("Start Date cannot be after End Date.");
        }

        int workingDays = 0;
        // Iterate through each day in the requested range
        for (var date = startDate.Date; date <= endDate; date = date.AddDays(1))
        {
            // Check if the day is NOT Friday (6) or Saturday (0) (Assuming Sunday=0)
            if (date.DayOfWeek != DayOfWeek.Friday && date.DayOfWeek != DayOfWeek.Saturday)
            {
                workingDays++;
            }
        }
        return workingDays;
    }

    // Step 1 & 2 Implementation: Submits the request and runs automated checks
    public async Task<RequestReadDto> ProcessNewLeaveRequestAsync(LeaveRequestCreateDto requestDto)
    {
        // *** NEW CHECK FOR FOREIGN KEY INTEGRITY ***
        // 1. Check if the submitting Employee ID exists in the DB before proceeding
        var submittingEmployee = await _employeeRepo.GetByIdAsync(requestDto.EmployeeId);
        if (submittingEmployee == null)
        {
            // This confirms the DB's current state and throws an error if the ID is truly missing.
            throw new UnauthorizedAccessException($"Error: Employee ID {requestDto.EmployeeId} is not valid or not found in the system.");
        }
        // ********************************************

        DateTime startDate = requestDto.StartDate.Date;
        DateTime endDate = requestDto.EndDate.Date;
        // 1. Calculate the actual number of requested working days
        int requestedDays = CalculateWorkingDays(startDate.Date, endDate.Date);
        if (requestedDays <= 0)
        {
            throw new ArgumentException("Leave request must include at least one working day.");
        }

        // 2. Check for overlapping requests (Important Logic)
        bool isConflicting = await _requestRepo.HasConflictingRequestAsync(requestDto. EmployeeId,startDate,endDate);
        if (isConflicting)
        {
            throw new InvalidOperationException("This employee already has an Approved or Pending leave request for this period.");
        }

        // 3. Get Leave Type Rules (Checks if deduction is required)
        var leaveTypeRules = await _leaveTypeRepo.GetLeaveRulesByIdAsync(requestDto.LeaveTypeId);
        if (leaveTypeRules == null)
        {
            throw new ArgumentException("Invalid Leave Type ID.");
        }

        string initialStatus = "Pending";

        // --- START AUTOMATED BALANCE CHECK (Step 2 Logic) ---
        if (leaveTypeRules.IsDeductFromBalance)
        {
            short currentYear = (short)DateTime.Now.Year;
            var balanceRecord = await _balanceRepo.GetBalanceForValidationAsync(requestDto.EmployeeId, requestDto.LeaveTypeId, currentYear);

            if (balanceRecord == null)
            {
                initialStatus = "AutoRejected - No Balance Allocated";
            }
            else
            {
                int availableDays = balanceRecord.AllocatedDays - balanceRecord.UsedDays;

                if (requestedDays > availableDays)
                {
                    initialStatus = "AutoRejected - Insufficient Balance";
                }
            }
        }
        // --- END AUTOMATED BALANCE CHECK ---

        // 4. Create the TPLRequest entity in the database
        var newRequestEntity = new TPLRequest
        {
            employee_id = requestDto.EmployeeId,
            leave_type_id = requestDto.LeaveTypeId,
            start_date = startDate.Date,
            end_date = endDate.Date,
            number_of_days = requestedDays,
            status = initialStatus,
            submission_date = DateTime.MaxValue, // Assuming submission date is today
            // Reason should be mapped from DTO if available
        };

        var createdEntity = await _requestRepo.AddAsync(newRequestEntity);

        // 5. Notification Logic (If Pending)
        if (createdEntity.status == "Pending")
        {
            // TODO: Use _employeeRepo to get manager's email and send notification
        }

        // 6. Return Read DTO (Manual Mapping)
        return new RequestReadDto
        {
            RequestId = createdEntity.request_id,
            EmployeeId = createdEntity.employee_id,
            StartDate = createdEntity.start_date,
            EndDate = createdEntity.end_date,
            NumberOfDays = createdEntity.number_of_days,
            Status = createdEntity.status,
            LeaveTypeName = leaveTypeRules.Name
        };
    }

    // Helper function: Retrieves a request and maps it to DTO
    public async Task<RequestReadDto> GetRequestByIdAsync(int requestId)
    {
        var request = await _requestRepo.GetByIdAsync(requestId);

        if (request == null) return null;

        var leaveType = await _leaveTypeRepo.GetLeaveRulesByIdAsync(request.leave_type_id);

        return new RequestReadDto
        {
            RequestId = request.request_id,
            EmployeeId = request.employee_id,
            StartDate = request.start_date,
            EndDate = request.end_date,
            NumberOfDays = request.number_of_days,
            Status = request.status,
            LeaveTypeName = leaveType?.Name
        };
    }

    // Step 3: Reject Leave Request (Manager Action)
    public async Task<bool> RejectLeaveRequestAsync(int requestId, int managerId)
    {
        var request = await _requestRepo.GetByIdAsync(requestId);

        if (request == null || request.status != "Pending") return false;

        bool success = await _requestRepo.UpdateRequestStatusAsync(requestId, "Rejected", managerId);

        // 3. (Optional) Notify the employee about the rejection

        return success;
    }

    // Step 3 & 4: Approve Leave Request (Manager Action) - Executes the Transaction
    public async Task<bool> ApproveLeaveRequestAsync(int requestId, int approvedById)
    {
        var request = await _requestRepo.GetByIdAsync(requestId);

        if (request == null || request.status != "Pending") return false;

        // --- START DATABASE TRANSACTION ---
        try
        {
            // 2. Step 4a: Update Request Status to Approved
            await _requestRepo.UpdateRequestStatusAsync(requestId, "Approved", approvedById);

            // 3. Step 4b: Update Leave Balance (Subtract days)
            short currentYear = (short)DateTime.Now.Year;
            await _balanceRepo.SubtractUsedDaysAsync(
                request.employee_id,
                request.leave_type_id,
                currentYear,
                request.number_of_days);

            // 4. Step 4c: Record the Leave Log
            await _leaveLogRepo.LogApprovedLeaveAsync( // Using the injected ITPLLeaveRepository
                request.employee_id,
                request.leave_type_id,
                request.number_of_days,
                request.start_date,
                request.end_date,
                requestId);

            // 5. (Optional) Notify the employee about the approval

            // --- END DATABASE TRANSACTION ---
            return true;
        }
        catch (Exception)
        {
            // Log the exception (ex)
            return false;
        }
    }
}