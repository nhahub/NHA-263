using HRSystem.BaseLibrary.DTOs;
using HRSystem.Infrastructure.Contracts;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class PerformanceEvaluationController : ControllerBase
    {
        private readonly IPerformanceEvaluationService _service;

        public PerformanceEvaluationController(IPerformanceEvaluationService service)
        {
            _service = service;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<PerformanceEvaluationReadDto>))]
        public async Task<IActionResult> GetAll()
        {
            var dtos = await _service.GetAllAsync();
            return Ok(dtos);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PerformanceEvaluationReadDto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var dto = await _service.GetByIdAsync(id);
            if (dto == null)
            {
                return NotFound(new { Message = $"Performance Evaluation with ID {id} not found." });
            }
            return Ok(dto);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(PerformanceEvaluationReadDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] PerformanceEvaluationCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdDto = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdDto.EvaluationID }, createdDto);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update(int id, [FromBody] PerformanceEvaluationUpdateDto dto)
        {
            if (id != dto.EvaluationID)
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
                return NotFound(new { Message = $"Performance Evaluation with ID {id} not found for update." });
            }

            return Ok(new { Message = "Performance Evaluation updated successfully." });
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result)
            {
                return NotFound(new { Message = $"Performance Evaluation with ID {id} not found." });
            }

            return NoContent();
        }
}


