// DTOs for LkpHRDepartment Entity

using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    // =================================================================================
    // 1. READ DTO (OUTPUT): Data sent to the Frontend (GET Requests)
    // =================================================================================

    public class HRDepartmentReadDto
    {
        // Primary Key & Foreign Key for reading
        public int DepartmentId { get; set; }
        public int BranchId { get; set; }

        // General Info
        public string NameEn { get; set; }
        public string NameAr { get; set; }
        public string Location { get; set; }
        public string Description { get; set; }
        public int? ManagerId { get; set; } // Nullable field is preserved

        // Audit Field
        public int CreatedBy { get; set; }
    }

    // =================================================================================
    // 2. CREATE DTO (INPUT): Data received to create a new record (POST)
    // =================================================================================

    public class HRDepartmentCreateDto
    {
        // BranchId is required to link the department to a parent branch
        [Required(ErrorMessage = "Branch ID is required.")]
        public int BranchId { get; set; }

        // English Name validation
        [Required(ErrorMessage = "English Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string NameEn { get; set; }

        // Arabic Name (Optional field based on Entity)
        [StringLength(150, ErrorMessage = "Name (Arabic) cannot exceed 150 characters.")]
        public string NameAr { get; set; }

        // Location
        [StringLength(150, ErrorMessage = "Location cannot exceed 150 characters.")]
        public string Location { get; set; }

        // Description
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string Description { get; set; }

        // Optional ManagerId (if assigned later)
        public int? ManagerId { get; set; }
    }

    // =================================================================================
    // 3. UPDATE DTO (INPUT): Data received to modify an existing record (PUT/PATCH)
    // =================================================================================

    public class HRDepartmentUpdateDto : HRDepartmentCreateDto
    {
        // The ID is required to identify the record being updated
        [Required(ErrorMessage = "DepartmentId is required for update.")]
        public int DepartmentId { get; set; }

        // Inherits all other properties (BranchId, NameEn, etc.) from CreateDto
    }
}
