// In HRSystem(Wizer)/Controllers/LeaveLogController.cs

using AutoMapper;
using HRSystem.BaseLibrary.DTOs;
using HRSystem.Infrastructure.Contracts;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
[Authorize] 
public class LeaveLogController : ControllerBase
{
    private readonly ITPLLeaveRepository _leaveLogRepo;
    private readonly IMapper _mapper;

    public LeaveLogController(ITPLLeaveRepository leaveLogRepo, IMapper mapper)
    {
        _leaveLogRepo = leaveLogRepo;
        _mapper = mapper;
    }

    // ----------------------------------------------------------------------
    // 1. GET: Get all approved leave records (HR/Admin view)
    // ----------------------------------------------------------------------
    [HttpGet]
    [Authorize(Roles = "admin,HR")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<LeaveLogReadDto>))]
    public async Task<IActionResult> GetAllLeaveLogs()
    {
        var entities = await _leaveLogRepo.GetAllAsync();
        var dtos = _mapper.Map<IEnumerable<LeaveLogReadDto>>(entities);
        return Ok(dtos);
    }

    // ----------------------------------------------------------------------
    // 2. GET: Get leave history for a specific employee
    // ----------------------------------------------------------------------
    [HttpGet("employee/{employeeId}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<LeaveLogReadDto>))]
    public async Task<IActionResult> GetEmployeeLeaveHistory(int employeeId)
    {
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        var loggedInEmployeeIdClaim = User.FindFirst("EmployeeID")?.Value;

        // نحتاج فقط لتنفيذ هذا الفحص إذا لم يكن المستخدم admin أو HR
        if (userRole != "admin" && userRole != "HR")
        {
            // إذا كان المستخدم ليس مديراً، يجب أن يكون ID المطلوب هو IDه الخاص
            if (loggedInEmployeeIdClaim == null || int.Parse(loggedInEmployeeIdClaim) != employeeId)
            {
                // منع الوصول: الموظف العادي يحاول رؤية ملف زميله
                return Forbid(); // 403 Forbidden
            }
        }
        var entities = await _leaveLogRepo.FindAsync(l => l.EmployeeID == employeeId);

        var dtos = _mapper.Map<IEnumerable<LeaveLogReadDto>>(entities);
        return Ok(dtos);
    }
}