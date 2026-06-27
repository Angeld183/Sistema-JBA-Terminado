using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ApiJBA.Entidades
{
    [Table("colaboraciones")]
    public class Colaboracion
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_orden { get; set; }

        [Required]
        public int id_proveedor { get; set; }

        [Required]
        [Column(TypeName = "varchar(20)")]
        [StringLength(20)]
        public string ci_representante { get; set; } = default!;

        [Required]
        [Column(TypeName = "varchar(16)")]
        [StringLength(16)]
        public string ci_p { get; set; } = default!;

        [Required]
        public DateTime fecha_registro { get; set; }

        [Column(TypeName = "varchar(255)")]
        [StringLength(255)]
        public string? observacion { get; set; }

        // Propiedades de navegación
        [ForeignKey("id_proveedor")]
        public Proveedor Proveedor { get; set; } = default!;

        [ForeignKey("ci_representante")]
        public Representante Representante { get; set; } = default!;

        [ForeignKey("ci_p")]
        public Personal Personal { get; set; } = default!;

        public Recepcion? Recepcion { get; set; }

        public ICollection<DetalleColaboracion> Detalles { get; set; } = new List<DetalleColaboracion>();
    }
}
