// In HRSystem(Wizer)/Controllers/EmployeeController.cs

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
[Authorize]

public class EmployeeController : ControllerBase
{
    private readonly ITPLEmployeeRepository _employeeRepo;
    private readonly IMapper _mapper;

    
    public EmployeeController(ITPLEmployeeRepository employeeRepo, IMapper mapper)
    {
        _employeeRepo = employeeRepo;
        _mapper = mapper;
    }

    // ----------------------------------------------------------------------
    // 0. GET: Get All Active Employees (NEW ENDPOINT)
    // ----------------------------------------------------------------------
    [HttpGet]
    [Authorize(Roles = "admin, HR")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<EmployeeReadDto>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAllEmployees()
    {
        try
        {
            // Assuming your ITPLEmployeeRepository has GetAllActiveAsync() or GetAllAsync()
            // We will use GetAllAsync() and let the Mapper/Client filter the status,
            // unless GetAllActiveAsync() is already implemented and preferred.

            // Note: For HR systems, it's common to only show employees with EmploymentStatus = 'Active'.
            // Assuming GetAllAsync() is the most robust way to start.
            var entities = await _employeeRepo.GetAllAsync();

            var dtos = _mapper.Map<IEnumerable<EmployeeReadDto>>(entities);
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            // Log error if logging is injected (assuming it is based on your other controllers)
            // _logger.LogError(ex, "Error retrieving all employees."); 
            return StatusCode(500, "An error occurred while retrieving the employee list.");
        }
    }


    // ----------------------------------------------------------------------
    // 1. POST: Create New Employee (HR Action)
    // ----------------------------------------------------------------------
    [HttpPost]
    [Authorize (Roles = "admin,HR")]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(EmployeeReadDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateEmployee([FromBody] EmployeeCreateDto dto)
    {
        
        var entity = _mapper.Map<TPLEmployee>(dto);

        
        var createdEntity = await _employeeRepo.AddAsync(entity);
        await _employeeRepo.SaveChangesAsync();


        var createdDto = _mapper.Map<EmployeeReadDto>(createdEntity);

        
        return CreatedAtAction(nameof(GetEmployee), new { id = createdDto.EmployeeId }, createdDto);
    }

    // ----------------------------------------------------------------------
    // 2. GET: Get Employee by ID
    // ----------------------------------------------------------------------
    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(EmployeeReadDto))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEmployee(int id)
    {
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        var loggedInEmployeeIdClaim = User.FindFirst("EmployeeID")?.Value;

        // نحتاج فقط لتنفيذ هذا الفحص إذا لم يكن المستخدم admin أو HR
        if (userRole != "admin" && userRole != "HR")
        {
            // إذا كان المستخدم ليس مديراً، يجب أن يكون ID المطلوب هو IDه الخاص
            if (loggedInEmployeeIdClaim == null || int.Parse(loggedInEmployeeIdClaim) != id)
            {
                // منع الوصول: الموظف العادي يحاول رؤية ملف زميله
                return Forbid(); // 403 Forbidden
            }
        }

        var entity = await _employeeRepo.GetEmployeeContactInfoAsync(id);
        if (entity == null)
        {
            return NotFound(new { Message = $"Employee with ID {id} not found." });
        }

        var dto = _mapper.Map<EmployeeReadDto>(entity);
        return Ok(dto);
    }

    // ----------------------------------------------------------------------
    // 3. PUT: Update Existing Employee Details
    // ----------------------------------------------------------------------
    [HttpPut("{id}")]
    [Authorize (Roles = "admin,HR")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateEmployee(int id, [FromBody] EmployeeUpdateDto dto)
    {
        if (id != dto.EmployeeId)
        {
            return BadRequest(new { Message = "ID mismatch between route and body." });
        }

        var existingEntity = await _employeeRepo.GetByIdAsync(id);
        if (existingEntity == null)
        {
            return NotFound(new { Message = $"Employee with ID {id} not found for update." });
        }

        
        _mapper.Map(dto, existingEntity);

        
        await _employeeRepo.UpdateAsync(existingEntity);
        await _employeeRepo.SaveChangesAsync();


        return NoContent(); // 204 No Content for successful update
    }

    // ----------------------------------------------------------------------
    // 4. DELETE: Remove Employee (HR Action)
    // ----------------------------------------------------------------------
    [HttpDelete("{id}")]
    [Authorize (Roles = "admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var entity = await _employeeRepo.GetByIdAsync(id);
        if (entity == null)
        {
            return NotFound(new { Message = $"Employee with ID {id} not found." });
        }

        await _employeeRepo.DeleteAsync(entity);
        await _employeeRepo.SaveChangesAsync();


        return NoContent();
    }
}