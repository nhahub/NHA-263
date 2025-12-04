// In HRSystem(Wizer)/Controllers/AttendanceController.cs

using AutoMapper;
using HRSystem.BaseLibrary.DTOs;
using HRSystem.BaseLibrary.Models;
using HRSystem.Infrastructure.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceRepository _attendanceRepo;
    private readonly IMapper _mapper;

    // Constants for Geo-Fencing (These should ideally be read from a config table)
    private const double CompanyLatitude = 31.204805;    // Office Central Latitude
    private const double CompanyLongitude = 29.939055;   // Office Central Longitude
    private const double AllowedRadiusInMeters = 500.0; // Allowed range (500 meters)

    public AttendanceController(IAttendanceRepository attendanceRepo, IMapper mapper)
    {
        _attendanceRepo = attendanceRepo;
        _mapper = mapper;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(userIdClaim, out int userId)) return userId;
        throw new UnauthorizedAccessException("User ID not found in token.");
    }

    // ----------------------------------------------------------------------
    // 1. POST: Check-In (Geo-Fencing Logic)
    // ----------------------------------------------------------------------
    [HttpPost("checkin")]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(AttendanceReadDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CheckIn([FromBody] AttendanceCreateDto dto)
    {
        try
        {
            dto.EmployeeID = GetCurrentUserId();
            var currentDate = DateTime.Now;

            // A. Check if already checked in today
            var existingRecord = await _attendanceRepo.GetTodayAttendanceRecordAsync(dto.EmployeeID, currentDate);
            if (existingRecord != null)
            {
                return BadRequest(new { Message = "You have already checked in today. Please use the CheckOut endpoint." });
            }

            // B. Geo-Fencing Check (Core Logic)
            if (!dto.CheckInLatitude.HasValue || !dto.CheckInLongitude.HasValue)
            {
                // Handle case where location services are off (Optional: Allow checkin for remote workers)
                return BadRequest(new { Message = "Location services must be enabled for Check-In." });
            }

            double latitude = (double)dto.CheckInLatitude.Value;
            double longitude = (double)dto.CheckInLongitude.Value;

            if (latitude == 0 && longitude == 0)
            {
                return BadRequest(new { Message = "Location coordinates are invalid." });
            }

            double distance = CalculateDistance(
                CompanyLatitude,
                CompanyLongitude,
                latitude,
                longitude
            );

            if (distance > AllowedRadiusInMeters)
            {
                return BadRequest(new { Message = $"Check-in failed. You are {distance:F2}m away, which is outside the allowed {AllowedRadiusInMeters}m radius." });
            }

            // C. Record CheckIn
            var entity = _mapper.Map<TPLAttendance>(dto);
            entity.Date = currentDate;
            entity.CheckIn = DateTime.Now;
            entity.Status = "Present";

            var createdEntity = await _attendanceRepo.AddAsync(entity);
            var createdDto = _mapper.Map<AttendanceReadDto>(createdEntity);

            return CreatedAtAction(nameof(GetAttendanceById), new { id = createdDto.AttendanceID }, createdDto);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = "Check-in failed: " + ex.Message });
        }
    }

    // ----------------------------------------------------------------------
    // 2. POST: Check-Out
    // ----------------------------------------------------------------------
    [HttpPost("checkout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CheckOut()
    {
        int employeeId = GetCurrentUserId();
        var currentDate = DateTime.Now;
        var currentTime = DateTime.Now;

        var existingRecord = await _attendanceRepo.GetTodayAttendanceRecordAsync(employeeId, currentDate);

        if (existingRecord == null)
        {
            return NotFound(new { Message = "No active check-in record found for today." });
        }

        bool success = await _attendanceRepo.RecordCheckOutAsync(existingRecord.AttendanceID, currentTime);

        if (success)
        {
            return Ok(new { Message = "Check-out recorded successfully." });
        }
        return BadRequest(new { Message = "Check-out failed." });
    }

    // ----------------------------------------------------------------------
    // 3. GET: Get Attendance Record by ID (for HR/Admin view)
    // ----------------------------------------------------------------------
    [HttpGet("{id}")]
    [Authorize(Roles = "HR,admin")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AttendanceReadDto))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAttendanceById(int id)
    {
        var entity = await _attendanceRepo.GetByIdAsync(id);
        if (entity == null) return NotFound();
        var dto = _mapper.Map<AttendanceReadDto>(entity);
        return Ok(dto);
    }
    private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double EarthRadiusMeters = 6371000d;
        double dLat = DegreesToRadians(lat2 - lat1);
        double dLon = DegreesToRadians(lon2 - lon1);

        double a = Math.Pow(Math.Sin(dLat / 2), 2) +
                   Math.Cos(DegreesToRadians(lat1)) *
                   Math.Cos(DegreesToRadians(lat2)) *
                   Math.Pow(Math.Sin(dLon / 2), 2);

        double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return EarthRadiusMeters * c;
    }

    private static double DegreesToRadians(double angle)
        => angle * (Math.PI / 180d);
}