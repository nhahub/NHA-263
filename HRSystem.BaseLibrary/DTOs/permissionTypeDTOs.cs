using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRSystem.BaseLibrary.DTOs
{
    public class LKPPermissionTypeReadDTO
    {
        public int permission_type_id { get; set; }
        public string permission_type_name { get; set; }
        public int monthly_limit_in_hours { get; set; }
        public bool is_deductible { get; set; }
    }

    public class LKPPermissionTypeCreateDTO
    {
        [Required]
        [StringLength(100)]
        public string permission_type_name { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int monthly_limit_in_hours { get; set; }

        public bool is_deductible { get; set; }
    }
    public class LKPPermissionTypeUpdateDTO
    {
        [StringLength(100)]
        public string permission_type_name { get; set; }

        [Range(0, int.MaxValue)]
        public int? monthly_limit_in_hours { get; set; }

        public bool? is_deductible { get; set; }
    }
}
