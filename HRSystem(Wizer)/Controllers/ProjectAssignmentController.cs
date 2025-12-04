using AutoMapper;
using HRSystem.BaseLibrary.DTOs;
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]

public class ProjectAssignmentController : ControllerBase
{
    private readonly ITPLProjectAssignmentRepository _assignRepo;
    private readonly IMapper _mapper;

    public ProjectAssignmentController(ITPLProjectAssignmentRepository assignRepo, IMapper mapper)
    {
        _assignRepo = assignRepo;
        _mapper = mapper;
    }
    // Helper to get the current Employee ID from the JWT Token (Assumes EmployeeID Claim exists)
    private int GetCurrentUserId()
    {
        var employeeIdClaim = User.FindFirst("EmployeeID")?.Value;

        if (int.TryParse(employeeIdClaim, out int employeeId))
        {
            return employeeId;
        }

        // If the token is valid but the EmployeeID claim is missing/invalid
        throw new UnauthorizedAccessException("Employee ID claim is missing or invalid in the token.");
    }

    // =========================================================================
    // POST: Assign Employee to Project (Create)
    // =========================================================================
    [HttpPost]
    [Authorize(Roles = "HR,admin")]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(TPLProjectAssignmentReadDTO))]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> AssignEmployee([FromBody] TPLProjectAssignmentCreateDTO dto)
    {
        // Logic 1: Prevent duplicate assignment
        bool alreadyAssigned = await _assignRepo.IsAssignedAsync(dto.EmployeeID, dto.ProjectID);
        if (alreadyAssigned)
        {
            return Conflict(new { Message = $"Employee {dto.EmployeeID} is already assigned to Project {dto.ProjectID}." });
        }

        var entity = _mapper.Map<TPLProjectAssignment>(dto);
        var createdEntity = await _assignRepo.AddAsync(entity);
        await _assignRepo.SaveChangesAsync();

        var createdDto = _mapper.Map<TPLProjectAssignmentReadDTO>(createdEntity);
        // Note: Using the single unique PK (assignment_id) for CreatedAtAction path
        return CreatedAtAction(nameof(GetAssignmentById), new { id = createdDto.assignment_id }, createdDto);
    }

    // =========================================================================
    // GET: Get All Assignments (Admin/HR View)
    // =========================================================================
    [HttpGet]
    [Authorize(Roles = "HR,admin")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<TPLProjectAssignmentReadDTO>))]
    public async Task<IActionResult> GetAllAssignments()
    {
        var entities = await _assignRepo.GetAllAsync();
        var dtos = _mapper.Map<IEnumerable<TPLProjectAssignmentReadDTO>>(entities);
        return Ok(dtos);
    }

    // =========================================================================
    // GET: Get Assignment by PK (assignment_id)
    // =========================================================================
    [HttpGet("{id}")]
    [Authorize(Roles = "HR,admin")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TPLProjectAssignmentReadDTO))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAssignmentById(int id)
    {
        // Assuming the primary key for the table is assignment_id (int)
        var entity = await _assignRepo.GetByIdAsync(id);

        if (entity == null)
        {
            return NotFound(new { Message = $"Assignment record with ID {id} not found." });
        }

        var dto = _mapper.Map<TPLProjectAssignmentReadDTO>(entity);
        return Ok(dto);
    }

    // =========================================================================
    // 4. GET: Get Assignments for the CURRENT Employee (SELF-SERVICE) (ADDED)
    // =========================================================================
    [HttpGet("my-assignments")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<TPLProjectAssignmentReadDTO>))]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> GetMyAssignments()
    {
        int employeeId = GetCurrentUserId();

        var entities = await _assignRepo.GetAssignmentsByEmployeeIdAsync(employeeId);

        var dtos = _mapper.Map<IEnumerable<TPLProjectAssignmentReadDTO>>(entities);
        return Ok(dtos);
    }



    // =========================================================================
    // DELETE: Remove Employee Assignment
    // =========================================================================
    [HttpDelete("{id}")]
    [Authorize(Roles = "HR,admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAssignment(int id)
    {
        var entityToDelete = await _assignRepo.GetByIdAsync(id);

        if (entityToDelete == null)
        {
            return NotFound(new { Message = $"Assignment record with ID {id} not found." });
        }

        // Note: This is a Hard Delete as it's a junction table without an IsDeleted flag
        await _assignRepo.DeleteAsync(entityToDelete);
        await _assignRepo.SaveChangesAsync();

        return NoContent();
    }
}