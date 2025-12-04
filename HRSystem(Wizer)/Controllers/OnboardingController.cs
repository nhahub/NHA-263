
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
public class OnboardingController : ControllerBase
{
    private readonly ITPLOnboardingRepository _onboardingRepo;
    private readonly IMapper _mapper;

    public OnboardingController(ITPLOnboardingRepository onboardingRepo, IMapper mapper)
    {
        _onboardingRepo = onboardingRepo;
        _mapper = mapper;
    }

    // =========================================================================
    // POST: Create New Onboarding Plan
    // =========================================================================
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(TPLOnboardingReadDTO))]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateOnboarding([FromBody] TPLOnboardingCreateDTO dto)
    {
        // Validation: Prevent duplicate entry for the same employee
        bool alreadyExists = await _onboardingRepo.IsEmployeeOnboardingAsync(dto.EmployeeID);
        if (alreadyExists)
        {
            return Conflict(new { Message = $"Onboarding record already exists for Employee ID {dto.EmployeeID}." });
        }

        var entity = _mapper.Map<TPLOnboarding>(dto);
        var createdEntity = await _onboardingRepo.AddAsync(entity);
        await _onboardingRepo.SaveChangesAsync();

        var createdDto = _mapper.Map<TPLOnboardingReadDTO>(createdEntity);
        return CreatedAtAction(nameof(GetOnboardingById), new { id = createdDto.OnboardingID }, createdDto);
    }

    // =========================================================================
    // GET: Get Onboarding Record by ID
    // =========================================================================
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TPLOnboardingReadDTO))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOnboardingById(int id)
    {
        var entity = await _onboardingRepo.GetByIdAsync(id);
        if (entity == null) return NotFound();

        var dto = _mapper.Map<TPLOnboardingReadDTO>(entity);
        return Ok(dto);
    }

    // =========================================================================
    // PUT: Update Onboarding Status/Mentor
    // =========================================================================
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateOnboarding(int id, [FromBody] TPLOnboardingUpdateDTO dto)
    {
        var existingEntity = await _onboardingRepo.GetByIdAsync(id);
        if (existingEntity == null) return NotFound();

        // Apply partial updates from DTO
        _mapper.Map(dto, existingEntity);

        await _onboardingRepo.UpdateAsync(existingEntity);
        await _onboardingRepo.SaveChangesAsync();

        return Ok(new { Message = "Onboarding record updated successfully." });
    }

    // =========================================================================
    // GET: Get All Onboarding Records (HR Reports)
    // =========================================================================
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<TPLOnboardingReadDTO>))]
    public async Task<IActionResult> GetAllOnboardings()
    {
        var entities = await _onboardingRepo.GetAllAsync();
        var dtos = _mapper.Map<IEnumerable<TPLOnboardingReadDTO>>(entities);
        return Ok(dtos);
    }
}