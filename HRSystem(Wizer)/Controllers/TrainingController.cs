using AutoMapper;
using HRSystem.BaseLibrary.DTOs;
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]

public class TrainingController : ControllerBase
{
    private readonly ITPLTrainingRepository _trainingRepo;
    private readonly IMapper _mapper;

    public TrainingController(ITPLTrainingRepository trainingRepo, IMapper mapper)
    {
        _trainingRepo = trainingRepo;
        _mapper = mapper;
    }

   


    // =========================================================================
    // POST: Create New Training Course (With Assignment Logic)
    // =========================================================================
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(TPLTrainingReadDTO))]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [Authorize(Roles = "HR,admin")]
    public async Task<IActionResult> CreateTraining([FromBody] TPLTrainingCreateDTO dto)
    {
        // 1. Validation: Check if the assigned employee already has this training title
        var existingAssignment = await _trainingRepo.IsEmployeeAssignedToTitleAsync(dto.EmployeeID, dto.Title);
        if (existingAssignment != null)
        {
            return Conflict(new { Message = $"Employee {dto.EmployeeID} is already assigned a training with title '{dto.Title}'." });
        }

        var entity = _mapper.Map<TPLTraining>(dto);
        var createdEntity = await _trainingRepo.AddAsync(entity);
        await _trainingRepo.SaveChangesAsync();

        var createdDto = _mapper.Map<TPLTrainingReadDTO>(createdEntity);
        return CreatedAtAction(nameof(GetTrainingById), new { id = createdDto.TrainingID }, createdDto);
    }

    // =========================================================================
    // GET: Get All Trainings (HR/Admin Only - Inherits Class-level Auth)
    // =========================================================================
    [HttpGet]
    [Authorize(Roles = "HR,admin")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<TPLTrainingReadDTO>))]
    public async Task<IActionResult> GetAllTrainings()
    {
        var entities = await _trainingRepo.GetAllAsync();
        var dtos = _mapper.Map<IEnumerable<TPLTrainingReadDTO>>(entities);
        return Ok(dtos);
    }

    // =========================================================================
    // GET: Get Training by ID (HR/Admin Only - Inherits Class-level Auth)
    // =========================================================================
    [HttpGet("{id}")]
    [Authorize(Roles = "HR,admin")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TPLTrainingReadDTO))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTrainingById(int id)
    {
        var entity = await _trainingRepo.GetByIdAsync(id);
        if (entity == null)
        {
            return NotFound(new { Message = $"Training with ID {id} not found." });
        }
        var dto = _mapper.Map<TPLTrainingReadDTO>(entity);
        return Ok(dto);
    }


    // =========================================================================
    // PUT: Update Training Course (HR/Admin Only - Inherits Class-level Auth)
    // =========================================================================
    [HttpPut("{id}")]
    [Authorize(Roles = "HR,admin")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TPLTrainingReadDTO))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateTraining(int id, [FromBody] TPLTrainingUpdateDTO dto)
    {
        var entityToUpdate = await _trainingRepo.GetByIdAsync(id);
        if (entityToUpdate == null)
        {
            return NotFound(new { Message = $"Training with ID {id} not found." });
        }

        // Validation: Check if the new title already exists for a *different* training
        if (!string.IsNullOrWhiteSpace(dto.Title) && dto.Title != entityToUpdate.Title)
        {
            var existing = await _trainingRepo.GetByTitleAsync(dto.Title);
            if (existing != null && existing.TrainingID != id)
            {
                return Conflict(new { Message = $"Training title '{dto.Title}' already exists for another training." });
            }
        }

        // Apply AutoMapper to apply changes from DTO to the retrieved entity
        _mapper.Map(dto, entityToUpdate);

        await _trainingRepo.UpdateAsync(entityToUpdate);
        await _trainingRepo.SaveChangesAsync();

        var updatedDto = _mapper.Map<TPLTrainingReadDTO>(entityToUpdate);
        return Ok(updatedDto);
    }

    // =========================================================================
    // DELETE: Delete Training Course (HR/Admin Only - Inherits Class-level Auth)
    // =========================================================================
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTraining(int id)
    {
        var entityToDelete = await _trainingRepo.GetByIdAsync(id);
        if (entityToDelete == null)
        {
            return NotFound(new { Message = $"Training with ID {id} not found." });
        }

        await _trainingRepo.DeleteAsync(entityToDelete);
        await _trainingRepo.SaveChangesAsync();

        return NoContent(); // 204 No Content indicates successful deletion
    }
}