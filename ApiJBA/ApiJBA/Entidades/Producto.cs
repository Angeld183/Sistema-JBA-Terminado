using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ApiJBA.Entidades
{
    [Table("producto")]
    public class Producto
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_producto { get; set; }

        [Required]
        public int id_categoria { get; set; }

        [Required]
        [Column(TypeName = "varchar(50)")]
        [StringLength(50)]
        public string codigo_corto { get; set; } = default!;

        [Required]
        [Column(TypeName = "varchar(255)")]
        [StringLength(255)]
        public string descripcion { get; set; } = default!;

        [Required]
        public int cant_min { get; set; }

        // Propiedades de navegación
        [ForeignKey("id_categoria")]
        public Categoria Categoria { get; set; } = default!;

        public ICollection<StockDeposito> StockDepositos { get; set; } = new List<StockDeposito>();
        public ICollection<DetalleColaboracion> DetalleColaboraciones { get; set; } = new List<DetalleColaboracion>();
        public ICollection<DetalleRecepcion> DetalleRecepciones { get; set; } = new List<DetalleRecepcion>();
        public ICollection<Traslado> Traslados { get; set; } = new List<Traslado>();
    }
}
