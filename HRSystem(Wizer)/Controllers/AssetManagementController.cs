
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

public class AssetManagementController : ControllerBase
{
    private readonly ITPLAssetManagementRepository _assetRepo;
    private readonly IMapper _mapper;

    public AssetManagementController(ITPLAssetManagementRepository assetRepo, IMapper mapper)
    {
        _assetRepo = assetRepo;
        _mapper = mapper;
    }

    // =========================================================================
    // POST: Assign New Asset (CREATE)
    // =========================================================================
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(TPLAssetManagementReadDTO))]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [Authorize(Roles = "HR,admin")]
    // =========================================================================
    // GET: Get Asset by ID (READ SINGLE) - RETAINED FOR CREATEDATACTION
    // =========================================================================
    [HttpGet("{id}")]
    [Authorize(Roles = "HR,admin")]
    public async Task<IActionResult> GetAssetById(int id) // يجب الاحتفاظ بهذه الدالة
    {
        var entity = await _assetRepo.GetByIdAsync(id);
        if (entity == null) return NotFound();

        var dto = _mapper.Map<TPLAssetManagementReadDTO>(entity);
        return Ok(dto);
    }

    // =========================================================================
    // GET: Get All Assets (THE NEW GET ALL)
    // =========================================================================
    [HttpGet] 
    [Authorize(Roles = "HR,admin")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<TPLAssetManagementReadDTO>))]
    public async Task<IActionResult> GetAllAssets()
    {
        var entities = await _assetRepo.GetAllAsync();
        var dtos = _mapper.Map<IEnumerable<TPLAssetManagementReadDTO>>(entities);
        return Ok(dtos);
    }

    // =========================================================================
    // GET: Get All Assets Assigned to an Employee (READ FILTERED)
    // =========================================================================
    [HttpGet("employee/{employeeId}")]
    [Authorize(Roles = "HR,admin")]
    public async Task<IActionResult> GetEmployeeAssets(int employeeId)
    {
        // 1. Extracting the current user's identity (from the token)
        int currentUserId = GetCurrentUserId();

        // 2. Security Guard Application: Prevents a regular employee from viewing another employee's data
        // If the user is not an HR or Admin, and requests an ID that does not match, the request is rejected.
        if (!User.IsInRole("HR") && !User.IsInRole("admin"))
        {
            if (employeeId != currentUserId)
            {
                return StatusCode(StatusCodes.Status403Forbidden,
                                  new { Message = "Access denied. You are only allowed to view your own assigned assets." });
            }
        }

        // 3. If he passes the security check (either because he is an HR or is requesting the same ID)
        var entities = await _assetRepo.GetAssetsByEmployeeIdAsync(employeeId);
        var dtos = _mapper.Map<IEnumerable<TPLAssetManagementReadDTO>>(entities);
        if (!entities.Any())
        {
            return NotFound(new { Message = $"No active assets found for Employee ID {employeeId}." });
        }

        return Ok(dtos);
    }

    

    // =========================================================================
    // GET: Get Assets for the CURRENT Employee (SELF-SERVICE)
    // =========================================================================
    // Helper to get the current Employee ID from the JWT Token
    private int GetCurrentUserId()
    {
        // 1. Search for the claim "EmployeeID"
        var employeeIdClaim = User.FindFirst("EmployeeID")?.Value;

        // 2. Try to convert it to an integer
        if (int.TryParse(employeeIdClaim, out int employeeId))
        {
            return employeeId;
        }

        // 3. Handling the case of an invalid or lost ID
        throw new UnauthorizedAccessException("Employee ID claim is missing or invalid in the token.");
    }

    [HttpGet("my-assets")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<TPLAssetManagementReadDTO>))]
    [Authorize] 
    public async Task<IActionResult> GetMyAssets()
    {
        // 1. Extract Employee ID from token using added function
        int employeeId = GetCurrentUserId();

        // 2. Filtering data based on the current user's identity
        var entities = await _assetRepo.GetAssetsByEmployeeIdAsync(employeeId);

        var dtos = _mapper.Map<IEnumerable<TPLAssetManagementReadDTO>>(entities);
        return Ok(dtos);
    }

    // =========================================================================
    // PUT: Update Asset Status/Return Date (UPDATE)
    // =========================================================================
    [HttpPut("{id}")]
    [Authorize(Roles = "HR,admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAsset(int id, [FromBody] TPLAssetManagementUpdateDTO dto)
    {
        var existingEntity = await _assetRepo.GetByIdAsync(id);
        if (existingEntity == null) return NotFound();

        // Apply partial updates from DTO
        _mapper.Map(dto, existingEntity);

        await _assetRepo.UpdateAsync(existingEntity);
        await _assetRepo.SaveChangesAsync();

        return Ok(new { Message = "Asset record updated successfully." });
    }

    // =========================================================================
    // DELETE: Delete Asset (Hard Delete - Use with caution)
    // =========================================================================
    [HttpDelete("{id}")]
    [Authorize(Roles = "HR,admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAsset(int id)
    {
        var entity = await _assetRepo.GetByIdAsync(id);
        if (entity == null) return NotFound();

        await _assetRepo.DeleteAsync(entity);
        await _assetRepo.SaveChangesAsync();

        return NoContent();
    }
}