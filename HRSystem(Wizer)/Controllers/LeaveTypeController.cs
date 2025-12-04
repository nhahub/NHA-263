// In HRSystem(Wizer)/Controllers/LeaveTypeController.cs

using AutoMapper;
using HRSystem.BaseLibrary.DTOs;
using HRSystem.BaseLibrary.Models; // لـ LKPLeaveType
using HRSystem.Infrastructure.Contracts; // لـ ILKPLeaveTypeRepository
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "HR,admin")] // User only: HR or administrators to access type innovations
public class LeaveTypeController : ControllerBase
{
    private readonly ILKPLeaveTypeRepository _leaveTypeRepo;
    private readonly IMapper _mapper;

    
    public LeaveTypeController(ILKPLeaveTypeRepository leaveTypeRepo, IMapper mapper)
    {
        _leaveTypeRepo = leaveTypeRepo;
        _mapper = mapper;
    }

    // ----------------------------------------------------------------------
    // 1. GET: Get All Leave Types
    // ----------------------------------------------------------------------
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<LeaveTypeReadDto>))]
    public async Task<IActionResult> GetLeaveTypes()
    {
        var entities = await _leaveTypeRepo.GetAllAsync();
        // Convert entities to DTOs to send to the user
        var dtos = _mapper.Map<IEnumerable<LeaveTypeReadDto>>(entities);
        return Ok(dtos);
    }

    // ----------------------------------------------------------------------
    // 2. GET: Get Leave Type by ID
    // ----------------------------------------------------------------------
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(LeaveTypeReadDto))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLeaveType(int id)
    {
        var entity = await _leaveTypeRepo.GetByIdAsync(id);

        if (entity == null)
        {
            return NotFound(new { Message = $"Leave Type with ID {id} not found." });
        }

        var dto = _mapper.Map<LeaveTypeReadDto>(entity);
        return Ok(dto);
    }

    // ----------------------------------------------------------------------
    // 3. POST: Create New Leave Type
    // ----------------------------------------------------------------------
    [HttpPost]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(LeaveTypeReadDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateLeaveType([FromBody] LeaveTypeCreateDto dto)
    {
        // 1. Convert DTO to Entity
        var entity = _mapper.Map<LKPLeaveType>(dto);

        // 2. Adding the entity to the database
        var createdEntity = await _leaveTypeRepo.AddAsync(entity);
         await _leaveTypeRepo.SaveChangesAsync();

        // 3. Convert the resulting Entity to ReadDto for response
        var createdDto = _mapper.Map<LeaveTypeReadDto>(createdEntity);

        // 4. Return 201 Created with access path
        return CreatedAtAction(nameof(GetLeaveType), new { id = createdDto.LeaveTypeId }, createdDto);
    }

    // ----------------------------------------------------------------------
    // 4. PUT: Update Existing Leave Type
    // ----------------------------------------------------------------------
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateLeaveType(int id, [FromBody] LeaveTypeUpdateDto dto)
    {
        if (id != dto.LeaveTypeId)
        {
            return BadRequest(new { Message = "ID mismatch between route and body." });
        }

        var existingEntity = await _leaveTypeRepo.GetByIdAsync(id);
        await _leaveTypeRepo.SaveChangesAsync();
        if (existingEntity == null)
        {
            return NotFound(new { Message = $"Leave Type with ID {id} not found for update." });
        }

        _mapper.Map(dto, existingEntity);

        await _leaveTypeRepo.UpdateAsync(existingEntity);
        await _leaveTypeRepo.SaveChangesAsync();

        return NoContent(); // 204 No Content for successful update
    }

    // ----------------------------------------------------------------------
    // 5. DELETE: Delete (or deactivate) Leave Type
    // ----------------------------------------------------------------------
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteLeaveType(int id)
    {
        var entity = await _leaveTypeRepo.GetByIdAsync(id);

        if (entity == null)
        {
            return NotFound(new { Message = $"Leave Type with ID {id} not found." });
        }

        await _leaveTypeRepo.DeleteAsync(entity);
        await _leaveTypeRepo.SaveChangesAsync();

        return NoContent(); // 204 No Content for successful deletion
    }
}