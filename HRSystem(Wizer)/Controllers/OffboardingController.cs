using AutoMapper;
using HRSystem.BaseLibrary.DTOs;
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "HR,admin")] 
public class OffboardingController : ControllerBase
{
    private readonly ITPLOffboardingRepository _offboardingRepo;
    private readonly IMapper _mapper;

    public OffboardingController(ITPLOffboardingRepository offboardingRepo, IMapper mapper)
    {
        _offboardingRepo = offboardingRepo;
        _mapper = mapper;
    }

    // =========================================================================
    // POST: Create New Offboarding Record (HR Action)
    // =========================================================================
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(TPLOffboardingReadDTO))]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateOffboarding([FromBody] TPLOffboardingCreateDTO dto)
    {
        // Validation: Prevent duplicate record for the same employee
        var existingRecord = await _offboardingRepo.GetOffboardingByEmployeeIdAsync(dto.EmployeeID);
        if (existingRecord != null) // Check if a record already exists
        {
            return Conflict(new { Message = $"An offboarding record already exists for Employee ID {dto.EmployeeID}." });
        }

        var entity = _mapper.Map<TPLOffboarding>(dto);
        var createdEntity = await _offboardingRepo.AddAsync(entity);
        await _offboardingRepo.SaveChangesAsync();

        var createdDto = _mapper.Map<TPLOffboardingReadDTO>(createdEntity);
        return CreatedAtAction(nameof(GetOffboardingById), new { id = createdDto.ExitID }, createdDto);
    }

    // =========================================================================
    // GET: Get Offboarding Record by ID
    // =========================================================================
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TPLOffboardingReadDTO))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOffboardingById(int id)
    {
        var entity = await _offboardingRepo.GetByIdAsync(id);
        if (entity == null) return NotFound();

        var dto = _mapper.Map<TPLOffboardingReadDTO>(entity);
        return Ok(dto);
    }

    // =========================================================================
    // PUT: Update Clearance Status and Exit Notes
    // =========================================================================
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateOffboarding(int id, [FromBody] TPLOffboardingUpdateDTO dto)
    {
        // 1. Get the existing record
        var existingEntity = await _offboardingRepo.GetByIdAsync(id);
        if (existingEntity == null) return NotFound();

        // 2. Apply partial updates from DTO
        _mapper.Map(dto, existingEntity);

        // 3. Save changes
        await _offboardingRepo.UpdateAsync(existingEntity);
        await _offboardingRepo.SaveChangesAsync();

        var updatedDto = _mapper.Map<TPLOffboardingReadDTO>(existingEntity);
        return Ok(updatedDto);
    }

    // =========================================================================
    // GET: Get All Offboarding Records (HR Reports)
    // =========================================================================
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<TPLOffboardingReadDTO>))]
    public async Task<IActionResult> GetAllOffboardings()
    {
        var entities = await _offboardingRepo.GetAllAsync();
        var dtos = _mapper.Map<IEnumerable<TPLOffboardingReadDTO>>(entities);
        return Ok(dtos);
    }
}