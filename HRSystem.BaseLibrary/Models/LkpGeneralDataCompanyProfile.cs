using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

public partial class LkpGeneralDataCompanyProfile
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int CompanyProfileId { get; set; }
    [Required(ErrorMessage = "Name is required")]
    [StringLength(150)]
    public string NameEn { get; set; }

    [Required(ErrorMessage = "Insurance number is required")]
    [StringLength(100)]
    [Unicode(false)]
    public string InsuranceNumber { get; set; }

    [Required(ErrorMessage = "Tax Number is required")]
    [StringLength(15)]
    public string TaxNumber { get; set; }

    [Required(ErrorMessage = "Phone Number is required")]
    [Phone]
    [StringLength(50)]
    public string PhoneNumber { get; set; }

    [StringLength(50)]
    public string FaxNumber { get; set; }

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress]
    [StringLength(100)]
    public string Email { get; set; }

    [Url]
    [StringLength(200)]
    public string WebSite { get; set; }

    [StringLength(256)]
    public string ImageURL { get; set; }

    [StringLength(300)]
    public string Address { get; set; }

    public Guid CompanyCode { get; set; }

    public int CreatedBy { get; set; }

    public bool IsDeleted { get; set; }

    [InverseProperty("Company")]
    public virtual ICollection<LkpGeneralDataBranch> LkpGeneralDataBranches { get; set; } = new List<LkpGeneralDataBranch>();
}
