using AutoMapper;
using HRSystem.BaseLibrary.DTOs;
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace HRSystem_Wizer_.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompanyProfileController : ControllerBase
    {
        private readonly ICompanyProfileRepository _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<CompanyProfileController> _logger;

        public CompanyProfileController(
            ICompanyProfileRepository repository,
            IMapper mapper,
            ILogger<CompanyProfileController> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
        }

        // Get all company profiles
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CompanyProfileReadDto>>> GetAll()
        {
            try
            {
                var companies = await _repository.GetAllActiveAsync();
                var companyDtos = _mapper.Map<IEnumerable<CompanyProfileReadDto>>(companies);
                return Ok(companyDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving company profiles");
                return StatusCode(500, "An error occurred while retrieving company profiles");
            }
        }

        // Get company profile by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<CompanyProfileReadDto>> GetById(int id)
        {
            try
            {
                var company = await _repository.GetByIdAsync(id);
                if (company == null || company.IsDeleted)
                {
                    return NotFound($"Company profile with ID {id} not found");
                }

                var companyDto = _mapper.Map<CompanyProfileReadDto>(company);
                return Ok(companyDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving company profile with ID {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the company profile");
            }
        }

        // Create a new company profile
        [HttpPost]
        public async Task<ActionResult<CompanyProfileReadDto>> Create([FromBody] CompanyProfileCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Check if company with same name already exists
                var existingCompany = await _repository.GetByNameAsync(createDto.Name);
                if (existingCompany != null)
                {
                    return Conflict($"A company profile with name '{createDto.Name}' already exists");
                }

                var company = _mapper.Map<LkpGeneralDataCompanyProfile>(createDto);
                company.CompanyCode = Guid.NewGuid();
                company.IsDeleted = false;

                await _repository.AddAsync(company);
                await _repository.SaveChangesAsync();

                var companyDto = _mapper.Map<CompanyProfileReadDto>(company);
                return CreatedAtAction(nameof(GetById), new { id = company.CompanyProfileId }, companyDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating company profile");
                return StatusCode(500, "An error occurred while creating the company profile");
            }
        }

        // Update an existing company profile
        [HttpPut("{id}")]
        public async Task<ActionResult<CompanyProfileReadDto>> Update(int id, [FromBody] CompanyProfileUpdateDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (id != updateDto.CompanyProfileId)
                {
                    return BadRequest("ID mismatch");
                }

                var company = await _repository.GetByIdAsync(id);
                if (company == null || company.IsDeleted)
                {
                    return NotFound($"Company profile with ID {id} not found");
                }

                _mapper.Map(updateDto, company);
                await _repository.UpdateAsync(company);
                await _repository.SaveChangesAsync();

                var companyDto = _mapper.Map<CompanyProfileReadDto>(company);
                return Ok(companyDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating company profile with ID {Id}", id);
                return StatusCode(500, "An error occurred while updating the company profile");
            }
        }

        // Delete (soft delete) a company profile
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var company = await _repository.GetByIdAsync(id);
                if (company == null || company.IsDeleted)
                {
                    return NotFound($"Company profile with ID {id} not found");
                }

                // Soft delete
                company.IsDeleted = true;
                await _repository.UpdateAsync(company);
                await _repository.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting company profile with ID {Id}", id);
                return StatusCode(500, "An error occurred while deleting the company profile");
            }
        }
    }
}

