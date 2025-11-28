using HRSystem.BaseLibrary.DTOs;
using HRSystem.Infrastructure.Contracts;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class RecruitmentPortalController : ControllerBase
    {
        private readonly IRecruitmentPortalService _service;

        public RecruitmentPortalController(IRecruitmentPortalService service)
        {
            _service = service;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<RecruitmentPortalReadDto>))]
        public async Task<IActionResult> GetAll()
        {
            var dtos = await _service.GetAllAsync();
            return Ok(dtos);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(RecruitmentPortalReadDto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var dto = await _service.GetByIdAsync(id);
            if (dto == null)
            {
                return NotFound(new { Message = $"Recruitment Portal with ID {id} not found." });
            }
            return Ok(dto);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(RecruitmentPortalReadDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] RecruitmentPortalCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdDto = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdDto.PortalID }, createdDto);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update(int id, [FromBody] RecruitmentPortalUpdateDto dto)
        {
            if (id != dto.PortalID)
            {
                return BadRequest(new { Message = "ID mismatch between route and body." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _service.UpdateAsync(id, dto);
            if (!result)
            {
                return NotFound(new { Message = $"Recruitment Portal with ID {id} not found for update." });
            }

            return Ok(new { Message = "Recruitment Portal updated successfully." });
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result)
            {
                return NotFound(new { Message = $"Recruitment Portal with ID {id} not found." });
            }

            return NoContent();
        }
}


