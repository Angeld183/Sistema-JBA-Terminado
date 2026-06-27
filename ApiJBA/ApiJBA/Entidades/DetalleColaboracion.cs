using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiJBA.Entidades
{
    [Table("detalle_colaboracion")]
    public class DetalleColaboracion
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_detalle { get; set; }

        [Required]
        public int id_orden { get; set; }

        [Required]
        public int id_producto { get; set; }

        [Required]
        public int cant_soli { get; set; }

        [Required]
        public int id_deposito { get; set; }

        // Propiedades de navegación
        [ForeignKey("id_orden")]
        public Colaboracion Colaboracion { get; set; } = default!;

        [ForeignKey("id_producto")]
        public Producto Producto { get; set; } = default!;

        [ForeignKey("id_deposito")]
        public Deposito Deposito { get; set; } = default!;
    }
}
