using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiJBA.Entidades
{
    [Table("detalle_recepcion")]
    public class DetalleRecepcion
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_detalle_rec { get; set; }

        [Required]
        public int id_recepcion { get; set; }

        [Required]
        public int id_producto { get; set; }

        [Required]
        public int cantidad_re { get; set; }

        public DateTime? fecha_vencimiento { get; set; }

        // Propiedades de navegación
        [ForeignKey("id_recepcion")]
        public Recepcion Recepcion { get; set; } = default!;

        [ForeignKey("id_producto")]
        public Producto Producto { get; set; } = default!;
    }
}
