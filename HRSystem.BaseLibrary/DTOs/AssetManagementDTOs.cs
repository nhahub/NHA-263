using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRSystem.BaseLibrary.DTOs
{
    public class TPLAssetManagementReadDTO
    {
        public int AssetID { get; set; }
        public string AssetName { get; set; }
        public string SerialNumber { get; set; }
        public int AssignedTo { get; set; }
        public DateTime AssignedDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string Status { get; set; }

    }

    public class TPLAssetManagementCreateDTO
    {
        [Required]
        [StringLength(100)]
        public string AssetName { get; set; }

        [Required]
        [StringLength(100)]
        public string SerialNumber { get; set; }

        [Required]
        public int AssignedTo { get; set; } 

        [Required]
        public DateTime AssignedDate { get; set; }

        public DateTime? ReturnDate { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; }
    }


    public class TPLAssetManagementUpdateDTO
    {
        [StringLength(100)]
        public string AssetName { get; set; }

        [StringLength(100)]
        public string SerialNumber { get; set; }

        public int? AssignedTo { get; set; } 

        public DateTime? AssignedDate { get; set; }

        public DateTime? ReturnDate { get; set; }

        [StringLength(50)]
        public string Status { get; set; } 
    }
}
