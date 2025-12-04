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
[Authorize(Roles = "HR,admin")]
public class ProjectController : ControllerBase
{
    private readonly ITPLProjectRepository _projectRepo;
    private readonly IMapper _mapper;

    public ProjectController(ITPLProjectRepository projectRepo, IMapper mapper)
    {
        _projectRepo = projectRepo;
        _mapper = mapper;
    }

    // =========================================================================
    // POST: Create New Project (Logic previously defined)
    // =========================================================================
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(TPLProjectReadDTO))]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateProject([FromBody] TPLProjectCreateDTO dto)
    {
        var existing = await _projectRepo.GetByNameAsync(dto.ProjectName);
        if (existing != null)
        {
            return Conflict(new { Message = $"Project title '{dto.ProjectName}' already exists." });
        }

        var entity = _mapper.Map<TPLProject>(dto);
        var createdEntity = await _projectRepo.AddAsync(entity);
        await _projectRepo.SaveChangesAsync();

        var createdDto = _mapper.Map<TPLProjectReadDTO>(createdEntity);
        return CreatedAtAction(nameof(GetProjectById), new { id = createdDto.ProjectID }, createdDto);
    }

    // =========================================================================
    // GET: Get All Projects (READ ALL)
    // =========================================================================
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<TPLProjectReadDTO>))]
    public async Task<IActionResult> GetAllProjects()
    {
        var entities = await _projectRepo.GetAllAsync();
        var dtos = _mapper.Map<IEnumerable<TPLProjectReadDTO>>(entities);
        return Ok(dtos);
    }

    // =========================================================================
    // GET: Get Project by ID (READ SINGLE)
    // =========================================================================
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TPLProjectReadDTO))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProjectById(int id)
    {
        var entity = await _projectRepo.GetByIdAsync(id);
        if (entity == null)
        {
            return NotFound(new { Message = $"Project with ID {id} not found." });
        }
        var dto = _mapper.Map<TPLProjectReadDTO>(entity);
        return Ok(dto);
    }

    // =========================================================================
    // PUT: Update Project Details (UPDATE)
    // =========================================================================
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TPLProjectReadDTO))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateProject(int id, [FromBody] TPLProjectUpdateDTO dto)
    {
        var entityToUpdate = await _projectRepo.GetByIdAsync(id);
        if (entityToUpdate == null)
        {
            return NotFound(new { Message = $"Project with ID {id} not found for update." });
        }

        // Optional: Check if the new title already exists for a *different* project
        if (!string.IsNullOrWhiteSpace(dto.ProjectName) && dto.ProjectName != entityToUpdate.ProjectName)
        {
            var existing = await _projectRepo.GetByNameAsync(dto.ProjectName);
            if (existing != null && existing.ProjectID != id)
            {
                return Conflict(new { Message = $"Project name '{dto.ProjectName}' already exists for another project." });
            }
        }

        // Apply changes from DTO to the retrieved entity
        _mapper.Map(dto, entityToUpdate);

        await _projectRepo.UpdateAsync(entityToUpdate);
        await _projectRepo.SaveChangesAsync();

        var updatedDto = _mapper.Map<TPLProjectReadDTO>(entityToUpdate);
        return Ok(updatedDto);
    }

    // =========================================================================
    // DELETE: Delete Project (DELETE)
    // =========================================================================
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var entityToDelete = await _projectRepo.GetByIdAsync(id);
        if (entityToDelete == null)
        {
            return NotFound(new { Message = $"Project with ID {id} not found." });
        }

        // Note: We use Hard Delete as TPLProject doesn't have an IsDeleted flag in the provided code
        // You may need to handle Foreign Key exceptions if assignments exist.
        await _projectRepo.DeleteAsync(entityToDelete);
        await _projectRepo.SaveChangesAsync();

        return NoContent(); // 204 No Content indicates successful deletion
    }
}