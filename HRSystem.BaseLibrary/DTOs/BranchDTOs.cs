// DTOs for LkpGeneralDataBranch Entity

using System.ComponentModel.DataAnnotations;

namespace HRSystem.BaseLibrary.DTOs
{
    // =================================================================================
    // 1. READ DTO (OUTPUT): Data sent to the Frontend (GET Requests)
    // =================================================================================

    public class BranchReadDto
    {
        // Primary Key & Foreign Key for reading
        public int BranchId { get; set; }
        public int CompanyId { get; set; }

        // General Info
        public string Code { get; set; }
        public string NameEn { get; set; }
        public string Description { get; set; }

        // Audit Field
        public int CreatedBy { get; set; }
    }

    // =================================================================================
    // 2. CREATE DTO (INPUT): Data received to create a new record (POST)
    // =================================================================================

    public class BranchCreateDto
    {
        // CompanyId is required to link the branch to a parent company
        [Required(ErrorMessage = "Company ID is required.")]
        public int CompanyId { get; set; }

        // Code validation
        [Required(ErrorMessage = "Branch Code is required.")]
        [StringLength(50, ErrorMessage = "Code cannot exceed 50 characters.")]
        public string Code { get; set; }

        // Name validation
        [Required(ErrorMessage = "Branch Name (English) is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string NameEn { get; set; }

        // Description is optional based on Entity
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string Description { get; set; }
    }

    // =================================================================================
    // 3. UPDATE DTO (INPUT): Data received to modify an existing record (PUT/PATCH)
    // =================================================================================

    public class BranchUpdateDto : BranchCreateDto
    {
        // The ID is required to identify the record being updated
        [Required(ErrorMessage = "BranchId is required for update.")]
        public int BranchId { get; set; }

        // We inherit CompanyId and other fields from BranchCreateDto
    }
}
