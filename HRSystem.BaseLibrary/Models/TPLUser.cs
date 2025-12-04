using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.BaseLibrary.Models;

[Table("TPLUser")]
[Index("EmployeeID", Name = "IX_User", IsUnique = true)]
[Index("Username", Name = "UQ__User__536C85E4A1E9872A", IsUnique = true)]
public partial class TPLUser
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int UserID { get; set; }

    public int EmployeeID { get; set; }

    [Required]
    [StringLength(50)]
    public string Username { get; set; }

    [Required]
    [StringLength(200)]
    public string PasswordHash { get; set; }

    [Required ]
    [StringLength(50)]
    public string Role { get; set; } = "Employee";

    [ForeignKey("EmployeeID")]
    [InverseProperty("TPLUser")]
    public virtual TPLEmployee Employee { get; set; }

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
