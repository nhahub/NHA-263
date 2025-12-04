
using AutoMapper;
using HRSystem.BaseLibrary.DTOs;
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "HR,admin")] 
public class PermissionTypeController : ControllerBase
{
    private readonly IPermissionTypeRepository _typeRepo;
    private readonly IMapper _mapper;

    public PermissionTypeController(IPermissionTypeRepository typeRepo, IMapper mapper)
    {
        _typeRepo = typeRepo;
        _mapper = mapper;
    }

    // ----------------------------------------------------------------------
    // 1. POST: Create New Permission Type (HR Action)
    // ----------------------------------------------------------------------
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(LKPPermissionTypeReadDTO))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePermissionType([FromBody] LKPPermissionTypeCreateDTO dto)
    {
        var existingType = await _typeRepo.GetByNameAsync(dto.permission_type_name);
        if (existingType != null)
        {
            return BadRequest(new { Message = $"Permission type '{dto.permission_type_name}' already exists." });
        }

        var entity = _mapper.Map<LKPPermissionType>(dto);

        var createdEntity = await _typeRepo.AddAsync(entity);

        var createdDto = _mapper.Map<LKPPermissionTypeReadDTO>(createdEntity);

        return CreatedAtAction(nameof(GetPermissionType), new { id = createdDto.permission_type_id }, createdDto);
    }

    // ----------------------------------------------------------------------
    // 2. GET: Get Permission Type by ID
    // ----------------------------------------------------------------------
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(LKPPermissionTypeReadDTO))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPermissionType(int id)
    {
        // استخدام GetPermissionRulesByIdAsync لجلب القواعد
        var entity = await _typeRepo.GetPermissionRulesByIdAsync(id);

        if (entity == null)
        {
            return NotFound();
        }

        var dto = _mapper.Map<LKPPermissionTypeReadDTO>(entity);
        return Ok(dto);
    }

    // ----------------------------------------------------------------------
    // 3. PUT: Update Existing Permission Type Rules
    // ----------------------------------------------------------------------
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePermissionType(int id, [FromBody] LKPPermissionTypeUpdateDTO dto)
    {
        var existingEntity = await _typeRepo.GetByIdAsync(id);
        if (existingEntity == null)
        {
            return NotFound();
        }

        _mapper.Map(dto, existingEntity);

        await _typeRepo.UpdateAsync(existingEntity);

        return NoContent();
    }

    // ----------------------------------------------------------------------
    // 4. GET: Get All Permission Types (For Dropdown/Admin View)
    // ----------------------------------------------------------------------
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<LKPPermissionTypeReadDTO>))]
    public async Task<IActionResult> GetAllPermissionTypes()
    {
        var entities = await _typeRepo.GetAllAsync();
        var dtos = _mapper.Map<IEnumerable<LKPPermissionTypeReadDTO>>(entities);
        return Ok(dtos);
    }

    // ----------------------------------------------------------------------
    // 5. DELETE: Delete Permission Type
    // ----------------------------------------------------------------------
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePermissionType(int id)
    {
        var entity = await _typeRepo.GetByIdAsync(id);
        if (entity == null) return NotFound();

        await _typeRepo.DeleteAsync(entity);
        return NoContent();
    }
}