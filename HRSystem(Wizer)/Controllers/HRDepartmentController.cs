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
    public class HRDepartmentController : ControllerBase
    {
        private readonly IHRDepartmentRepository _repository;
        private readonly IBranchRepository _branchRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<HRDepartmentController> _logger;

        public HRDepartmentController(
            IHRDepartmentRepository repository,
            IBranchRepository branchRepository,
            IMapper mapper,
            ILogger<HRDepartmentController> logger)
        {
            _repository = repository;
            _branchRepository = branchRepository;
            _mapper = mapper;
            _logger = logger;
        }

        // Get all HR departments
        [HttpGet]
        [Authorize(Roles = "admin ,HR ")]
        public async Task<ActionResult<IEnumerable<HRDepartmentReadDto>>> GetAll()
        {
            try
            {
                var departments = await _repository.GetAllActiveAsync();
                var departmentDtos = _mapper.Map<IEnumerable<HRDepartmentReadDto>>(departments);
                return Ok(departmentDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving HR departments");
                return StatusCode(500, "An error occurred while retrieving HR departments");
            }
        }

        // Get HR department by ID
        [HttpGet("{id}")]
        [Authorize(Roles = "admin ,HR ")]
        public async Task<ActionResult<HRDepartmentReadDto>> GetById(int id)
        {
            try
            {
                var department = await _repository.GetByIdAsync(id);
                if (department == null || department.IsDeleted)
                {
                    return NotFound($"HR Department with ID {id} not found");
                }

                var departmentDto = _mapper.Map<HRDepartmentReadDto>(department);
                return Ok(departmentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving HR department with ID {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the HR department");
            }
        }

        // Get HR departments by branch ID
        [HttpGet("branch/{branchId}")]
        [Authorize(Roles = "admin ,HR ")]
        public async Task<ActionResult<IEnumerable<HRDepartmentReadDto>>> GetByBranchId(int branchId)
        {
            try
            {
                var departments = await _repository.GetByBranchIdAsync(branchId);
                var departmentDtos = _mapper.Map<IEnumerable<HRDepartmentReadDto>>(departments);
                return Ok(departmentDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving HR departments for branch {BranchId}", branchId);
                return StatusCode(500, "An error occurred while retrieving HR departments");
            }
        }

        // Create a new HR department
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<HRDepartmentReadDto>> Create([FromBody] HRDepartmentCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Check if branch exists
                var branch = await _branchRepository.GetByIdAsync(createDto.BranchId);
                if (branch == null || branch.IsDeleted)
                {
                    return NotFound($"Branch with ID {createDto.BranchId} not found");
                }

                var department = _mapper.Map<LkpHRDepartment>(createDto);
                department.IsDeleted = false;

                await _repository.AddAsync(department);
                await _repository.SaveChangesAsync();

                var departmentDto = _mapper.Map<HRDepartmentReadDto>(department);
                return CreatedAtAction(nameof(GetById), new { id = department.DepartmentId }, departmentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating HR department");
                return StatusCode(500, "An error occurred while creating the HR department");
            }
        }

        // Update an existing HR department
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<HRDepartmentReadDto>> Update(int id, [FromBody] HRDepartmentUpdateDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (id != updateDto.DepartmentId)
                {
                    return BadRequest("ID mismatch");
                }

                var department = await _repository.GetByIdAsync(id);
                if (department == null || department.IsDeleted)
                {
                    return NotFound($"HR Department with ID {id} not found");
                }

                // Check if branch exists
                var branch = await _branchRepository.GetByIdAsync(updateDto.BranchId);
                if (branch == null || branch.IsDeleted)
                {
                    return NotFound($"Branch with ID {updateDto.BranchId} not found");
                }

                _mapper.Map(updateDto, department);
                await _repository.UpdateAsync(department);
                await _repository.SaveChangesAsync();

                var departmentDto = _mapper.Map<HRDepartmentReadDto>(department);
                return Ok(departmentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating HR department with ID {Id}", id);
                return StatusCode(500, "An error occurred while updating the HR department");
            }
        }

        // Delete (soft delete) an HR department
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var department = await _repository.GetByIdAsync(id);
                if (department == null || department.IsDeleted)
                {
                    return NotFound($"HR Department with ID {id} not found");
                }

                // Soft delete
                department.IsDeleted = true;
                await _repository.UpdateAsync(department);
                await _repository.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting HR department with ID {Id}", id);
                return StatusCode(500, "An error occurred while deleting the HR department");
            }
        }
    }
}

