using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ApiJBA.Entidades
{
    [Table("recepcion")]
    public class Recepcion
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_recepcion { get; set; }

        [Required]
        public int id_orden { get; set; }

        [Required]
        [Column(TypeName = "varchar(16)")]
        [StringLength(16)]
        public string ci_p { get; set; } = default!;

        [Required]
        public DateTime fecha_registro { get; set; }

        // Propiedades de navegación
        [ForeignKey("id_orden")]
        public Colaboracion Colaboracion { get; set; } = default!;

        [ForeignKey("ci_p")]
        public Personal Personal { get; set; } = default!;

        public ICollection<DetalleRecepcion> Detalles { get; set; } = new List<DetalleRecepcion>();
    }
}
