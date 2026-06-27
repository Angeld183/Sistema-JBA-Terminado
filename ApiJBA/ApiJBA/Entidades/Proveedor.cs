using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ApiJBA.Entidades
{
    [Table("proveedor")]
    public class Proveedor
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_proveedor { get; set; }

        [Required]
        [Column(TypeName = "varchar(100)")]
        [StringLength(100)]
        public string nombre_proveedor { get; set; } = default!;

        [Required]
        [Column(TypeName = "varchar(50)")]
        [StringLength(50)]
        public string num_proveedor { get; set; } = default!;

        // Propiedades de navegación
        public ICollection<Colaboracion> Colaboraciones { get; set; } = new List<Colaboracion>();
    }
}
