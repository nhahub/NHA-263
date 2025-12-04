using AutoMapper;
using HRSystem.BaseLibrary.DTOs;
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
[Authorize] // HR/Admin allocates, Manager may view balances
public class LeaveBalanceController : ControllerBase
{
    private readonly ITPLLeaveBalanceRepository _balanceRepo;
    private readonly IMapper _mapper;

    public LeaveBalanceController(ITPLLeaveBalanceRepository balanceRepo, IMapper mapper)
    {
        _balanceRepo = balanceRepo;
        _mapper = mapper;
    }

    // ----------------------------------------------------------------------
    // 1. POST: Allocate Initial Balance (HR/Admin Action)
    // ----------------------------------------------------------------------
    [HttpPost]
    [Authorize(Roles = "HR,admin")]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(LeaveBalanceReadDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AllocateBalance([FromBody] LeaveBalanceCreateDto dto)
    {
        // 1. Check if balance already exists for the year/type/employee
        // (This check should ideally be done in a Service, but for basic CRUD we check here)
        var existingBalance = await _balanceRepo.GetBalanceForValidationAsync(dto.EmployeeId, dto.LeaveTypeId, dto.Year);
        if (existingBalance != null)
        {
            return BadRequest(new { Message = $"Balance already exists for Employee {dto.EmployeeId} for the year {dto.Year}." });
        }

        // 2. Map DTO to Entity (UsedDays defaults to 0 on creation)
        var entity = _mapper.Map<TPLLeaveBalance>(dto);
        entity.UsedDays = 0; // Ensure UsedDays is explicitly 0

        // 3. Add to Database
        var createdEntity = await _balanceRepo.AddAsync(entity);
        var createdDto = _mapper.Map<LeaveBalanceReadDto>(createdEntity);
        await _balanceRepo.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBalanceByEmployeeId), new { employeeId = createdDto.EmployeeId }, createdDto);
    }

    // ----------------------------------------------------------------------
    // 2. GET: Get Balances for a Specific Employee (Employee/Manager View)
    // ----------------------------------------------------------------------
    [HttpGet("employee/{employeeId}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<LeaveBalanceReadDto>))]
    public async Task<IActionResult> GetBalanceByEmployeeId(int employeeId)
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
        // Assuming your GenericRepository has a method to get by filter
        // If not, you may need a custom method in ITPLLeaveBalanceRepository to fetch all balances for an employee
        var entities = await _balanceRepo.FindAsync(b => b.EmployeeId == employeeId);

        var dtos = _mapper.Map<IEnumerable<LeaveBalanceReadDto>>(entities);
        return Ok(dtos);
    }

    // ----------------------------------------------------------------------
    // 3. PUT: Adjust Balance Manually (Internal HR Action)
    // ----------------------------------------------------------------------
    [HttpPut("{balanceId}")]
    [Authorize(Roles = "HR,admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AdjustBalance(int balanceId, [FromBody] LeaveBalanceInternalUpdateDto dto)
    {
        if (balanceId != dto.BalanceId)
        {
            return BadRequest(new { Message = "ID mismatch." });
        }

        var existingBalance = await _balanceRepo.GetByIdAsync(balanceId);
        if (existingBalance == null)
        {
            return NotFound(new { Message = $"Balance ID {balanceId} not found." });
        }

        // Apply manual adjustment/correction to UsedDays
        _mapper.Map(dto, existingBalance);

        await _balanceRepo.UpdateAsync(existingBalance);
        await _balanceRepo.SaveChangesAsync();

        return NoContent();
    }
}