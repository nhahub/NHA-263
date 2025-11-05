using AutoMapper;
using HRSystem.BaseLibrary.DTOs;
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRSystem_Wizer_.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BranchController : ControllerBase
    {
        private readonly IBranchRepository _repository;
        private readonly ICompanyProfileRepository _companyRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<BranchController> _logger;

        public BranchController(
            IBranchRepository repository,
            ICompanyProfileRepository companyRepository,
            IMapper mapper,
            ILogger<BranchController> logger)
        {
            _repository = repository;
            _companyRepository = companyRepository;
            _mapper = mapper;
            _logger = logger;
        }

        // Get all branches
        [HttpGet]
        [Authorize(Roles = "admin, HR")]
        public async Task<ActionResult<IEnumerable<BranchReadDto>>> GetAll()
        {
            try
            {
                var branches = await _repository.GetAllActiveAsync();
                var branchDtos = _mapper.Map<IEnumerable<BranchReadDto>>(branches);
                return Ok(branchDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving branches");
                return StatusCode(500, "An error occurred while retrieving branches");
            }
        }

        // Get branch by ID
        [HttpGet("{id}")]
        [Authorize(Roles = "admin, HR")]
        public async Task<ActionResult<BranchReadDto>> GetById(int id)
        {
            try
            {
                var branch = await _repository.GetByIdAsync(id);
                if (branch == null || branch.IsDeleted)
                {
                    return NotFound($"Branch with ID {id} not found");
                }

                var branchDto = _mapper.Map<BranchReadDto>(branch);
                return Ok(branchDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving branch with ID {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the branch");
            }
        }

        // Get branches by company ID
        [HttpGet("company/{companyId}")]
        [Authorize(Roles = "admin, HR")]
        public async Task<ActionResult<IEnumerable<BranchReadDto>>> GetByCompanyId(int companyId)
        {
            try
            {
                var branches = await _repository.GetByCompanyIdAsync(companyId);
                var branchDtos = _mapper.Map<IEnumerable<BranchReadDto>>(branches);
                return Ok(branchDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving branches for company {CompanyId}", companyId);
                return StatusCode(500, "An error occurred while retrieving branches");
            }
        }

        // Create a new branch
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<BranchReadDto>> Create([FromBody] BranchCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Check if company exists
                var company = await _companyRepository.GetByIdAsync(createDto.CompanyId);
                if (company == null || company.IsDeleted)
                {
                    return NotFound($"Company with ID {createDto.CompanyId} not found");
                }

                // Check if branch with same code already exists
                var existingBranch = await _repository.GetByCodeAsync(createDto.Code);
                if (existingBranch != null)
                {
                    return Conflict($"A branch with code '{createDto.Code}' already exists");
                }

                var branch = _mapper.Map<LkpGeneralDataBranch>(createDto);
                branch.IsDeleted = false;

                await _repository.AddAsync(branch);
                await _repository.SaveChangesAsync();

                var branchDto = _mapper.Map<BranchReadDto>(branch);
                return CreatedAtAction(nameof(GetById), new { id = branch.BranchId }, branchDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating branch");
                return StatusCode(500, "An error occurred while creating the branch");
            }
        }

        // Update an existing branch
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<BranchReadDto>> Update(int id, [FromBody] BranchUpdateDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (id != updateDto.BranchId)
                {
                    return BadRequest("ID mismatch");
                }

                var branch = await _repository.GetByIdAsync(id);
                if (branch == null || branch.IsDeleted)
                {
                    return NotFound($"Branch with ID {id} not found");
                }

                // Check if company exists
                var company = await _companyRepository.GetByIdAsync(updateDto.CompanyId);
                if (company == null || company.IsDeleted)
                {
                    return NotFound($"Company with ID {updateDto.CompanyId} not found");
                }

                _mapper.Map(updateDto, branch);
                await _repository.UpdateAsync(branch);
                await _repository.SaveChangesAsync();

                var branchDto = _mapper.Map<BranchReadDto>(branch);
                return Ok(branchDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating branch with ID {Id}", id);
                return StatusCode(500, "An error occurred while updating the branch");
            }
        }

        // Delete (soft delete) a branch
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var branch = await _repository.GetByIdAsync(id);
                if (branch == null || branch.IsDeleted)
                {
                    return NotFound($"Branch with ID {id} not found");
                }

                // Soft delete
                branch.IsDeleted = true;
                await _repository.UpdateAsync(branch);
                await _repository.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting branch with ID {Id}", id);
                return StatusCode(500, "An error occurred while deleting the branch");
            }
        }
    }
}

