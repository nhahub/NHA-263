// In HRSystem(Wizer)/Controllers/LeaveRequestController.cs

using HRSystem.BaseLibrary.DTOs;
using HRSystem.Core.Services; // Assuming ILeaveManagementService is referenced here
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Assume only authenticated users can access this controller
public class LeaveRequestController : ControllerBase
{
    private readonly ILeaveManagementService _leaveService;

    // Inject the ILeaveManagementService (DI is ready for this now!)
    public LeaveRequestController(ILeaveManagementService leaveService)
    {
        _leaveService = leaveService;
    }

    // Helper to get the current User ID from the JWT Token
    // Helper to get the current Employee ID from the JWT Token
    private int GetCurrentUserId() // You can change the name to GetCurrentEmployeeId() for greater clarity
    {
        // 1. Find the specific Claim "EmployeeID"
        var employeeIdClaim = User.FindFirst("EmployeeID")?.Value;

        // 2. Try converting it to a proper number (Employee ID)
        if (int.TryParse(employeeIdClaim, out int employeeId))
        {
          
            return employeeId;
        }

        // 3. If it fails, throw an error because the current user does not have a valid Employee ID
        throw new UnauthorizedAccessException("Employee ID is missing or invalid in the token. The user may not be associated with a valid employee profile.");
    }

    // ----------------------------------------------------------------------
    // 1. Employee Action: Submit New Leave Request (Step 1 & 2 Logic)
    // ----------------------------------------------------------------------
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(RequestReadDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SubmitLeaveRequest([FromBody] LeaveRequestCreateDto dto)
    {
        try
        {
            // Use ID from the token for security, overriding the DTO's EmployeeId
            dto.EmployeeId = GetCurrentUserId();

            var result = await _leaveService.ProcessNewLeaveRequestAsync(dto);

            // Return status based on the automated check
            if (result.Status.StartsWith("AutoRejected"))
            {
                return BadRequest(new { Message = "Request automatically rejected: " + result.Status, Status = result.Status });
            }

            return Ok(result); // Status should be 'Pending'
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message }); // Handles overlap checks
        }

    }

    // ----------------------------------------------------------------------
    // 2. Manager Action: Approve Request (Step 3 & 4 Logic)
    // ----------------------------------------------------------------------
    [HttpPost("approve/{requestId}")]
    [Authorize(Roles = "admin,HR")] // Only Managers or HR can approve
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ApproveRequest(int requestId)
    {
        int managerId = GetCurrentUserId();

        bool success = await _leaveService.ApproveLeaveRequestAsync(requestId, managerId);

        if (success)
        {
            return Ok(new { Message = "Leave request approved successfully and balance updated." });
        }

        return BadRequest(new { Message = "Could not approve request. It may already be processed or not exist." });
    }

    // ----------------------------------------------------------------------
    // 3. Manager Action: Reject Request (Step 3 Logic)
    // ----------------------------------------------------------------------
    [HttpPost("reject/{requestId}")]
    [Authorize(Roles = "admin,HR")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RejectRequest(int requestId)
    {
        int managerId = GetCurrentUserId();

        bool success = await _leaveService.RejectLeaveRequestAsync(requestId, managerId);

        if (success)
        {
            return Ok(new { Message = "Leave request rejected successfully." });
        }

        return BadRequest(new { Message = "Could not reject request. It may already be processed or not exist." });
    }
}