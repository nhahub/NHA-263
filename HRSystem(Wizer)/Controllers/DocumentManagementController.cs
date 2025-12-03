using AutoMapper;
using HRSystem.BaseLibrary.DTOs;
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HRSystem_Wizer_.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DocumentManagementController : ControllerBase
    {
        private readonly IGenericRepository<TPLDocumentManagement> _repository;
        private readonly IMapper _mapper;

        public DocumentManagementController(IGenericRepository<TPLDocumentManagement> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        [HttpGet]
        [Authorize(Roles = "admin,HR")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<DocumentManagementReadDto>))]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var entities = await _repository.GetAllAsync();
                var dtos = _mapper.Map<IEnumerable<DocumentManagementReadDto>>(entities);
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "admin,HR")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(DocumentManagementReadDto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null)
                {
                    return NotFound(new { Message = $"Document with ID {id} not found." });
                }

                var dto = _mapper.Map<DocumentManagementReadDto>(entity);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
        // ====================== 3. GET BY EMPLOYEE ID (القراءة حسب الموظف) ======================
        [HttpGet("employee/{employeeId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<DocumentManagementReadDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByEmployeeId(int employeeId)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var loggedInEmployeeIdClaim = User.FindFirst("EmployeeID")?.Value;

                // نحتاج فقط لتنفيذ هذا الفحص إذا لم يكن المستخدم admin أو HR
                if (userRole != "admin" && userRole != "HR")
                {
                    // إذا كان المستخدم ليس مديراً، يجب أن يكون ID المطلوب هو IDه الخاص
                    if (loggedInEmployeeIdClaim == null || int.Parse(loggedInEmployeeIdClaim) != id)
                    {
                        // منع الوصول: الموظف العادي يحاول رؤية ملف زميله
                        return Forbid(); // 403 Forbidden
                    }
                }
                var entities = await _repository.FindAsync(d => d.EmployeeID == employeeId);

                if (entities == null || !entities.Any())
                {
                    // العودة بـ 404 إذا لم يتم العثور على أي وثائق للموظف المحدد
                    return NotFound(new { Message = $"No documents found for Employee ID {employeeId}." });
                }

                var dtos = _mapper.Map<IEnumerable<DocumentManagementReadDto>>(entities);
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost]
        [Authorize(Roles = "admin,HR")]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(DocumentManagementReadDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] DocumentManagementCreateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var entity = _mapper.Map<TPLDocumentManagement>(dto);
                var createdEntity = await _repository.AddAsync(entity);
                await _repository.SaveChangesAsync();

                var createdDto = _mapper.Map<DocumentManagementReadDto>(createdEntity);
                return CreatedAtAction(nameof(GetById), new { id = createdDto.DocumentID }, createdDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin,HR"]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] DocumentManagementUpdateDto dto)
        {
            try
            {
                if (id != dto.DocumentID)
                {
                    return BadRequest(new { Message = "ID mismatch between route and body." });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var existingEntity = await _repository.GetByIdAsync(id);
                if (existingEntity == null)
                {
                    return NotFound(new { Message = $"Document with ID {id} not found." });
                }

                _mapper.Map(dto, existingEntity);
                await _repository.UpdateAsync(existingEntity);
                await _repository.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null)
                {
                    return NotFound(new { Message = $"Document with ID {id} not found." });
                }

                await _repository.DeleteAsync(entity);
                await _repository.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}




