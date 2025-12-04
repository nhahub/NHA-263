// In HRSystem(Wizer)/Controllers/PermissionRequestController.cs

using AutoMapper;
using HRSystem.BaseLibrary.DTOs;
using HRSystem.Infrastructure.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc; 
using System.Security.Claims;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PermissionRequestController : ControllerBase
{
    // ... Declarations and Constructor
    private readonly IPermissionManagementService _permissionService;
    private readonly IMapper _mapper;
    private readonly IPermissionRepository _permissionRepo;

    public PermissionRequestController(IPermissionManagementService permissionService, IMapper mapper, IPermissionRepository permissionRepo)
    {
        _permissionService = permissionService;
        _mapper = mapper;
        _permissionRepo = permissionRepo;
    }

    // Helper to get the current Employee ID (Keep this inside)
    private int GetCurrentUserId()
    {
        var employeeIdClaim = User.FindFirst("EmployeeID")?.Value;
        if (int.TryParse(employeeIdClaim, out int employeeId)) return employeeId;
        throw new UnauthorizedAccessException("Employee ID claim is missing or invalid in the token.");
    }

    // ----------------------------------------------------------------------
    // 5. GET: Get ALL Permission Requests (HR/Admin Audit View)
    // ----------------------------------------------------------------------
    [HttpGet]
    [Authorize(Roles = "admin,HR")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<PermissionReadDto>))]
    public async Task<IActionResult> GetAllPermissionRequests()
    {
        var entities = await _permissionRepo.GetAllAsync();
        var dtos = _mapper.Map<IEnumerable<PermissionReadDto>>(entities);
        return Ok(dtos);
    }


    // ----------------------------------------------------------------------
    // 2. GET: Get Request Details
    // ----------------------------------------------------------------------
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PermissionReadDto))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPermissionRequest(int id)
    {
        var result = await _permissionService.GetPermissionRequestByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    // ----------------------------------------------------------------------
    // 3. POST: Approve Request (Manager Action)
    // ----------------------------------------------------------------------
    [HttpPost("approve/{permissionId}")]
    [Authorize(Roles = "admin,HR")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ApproveRequest(int permissionId)
    {
        int managerId = GetCurrentUserId();
        bool success = await _permissionService.ApprovePermissionRequestAsync(permissionId, managerId);

        if (success)
        {
            return Ok(new { Message = "Permission request approved successfully." });
        }
        return BadRequest(new { Message = "Could not approve request. It may already be processed or not exist." });
    }

    // ----------------------------------------------------------------------
    // 4. POST: Reject Request (Manager Action)
    // ----------------------------------------------------------------------
    [HttpPost("reject/{permissionId}")]
    [Authorize(Roles = "admin,HR")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RejectRequest(int permissionId)
    {
        int managerId = GetCurrentUserId();
        bool success = await _permissionService.RejectPermissionRequestAsync(permissionId, managerId);

        if (success)
        {
            return Ok(new { Message = "Permission request rejected successfully." });
        }
        return BadRequest(new { Message = "Could not reject request. It may already be processed or not exist." });
    }
} 