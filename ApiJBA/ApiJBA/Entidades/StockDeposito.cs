using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiJBA.Entidades
{
    [Table("stock_deposito")]
    public class StockDeposito
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_stock { get; set; }

        [Required]
        public int id_deposito { get; set; }

        [Required]
        public int id_producto { get; set; }

        [Required]
        public int cantidad { get; set; }

        [Required]
        public int cantidad_min { get; set; }

        // Propiedades de navegación
        [ForeignKey("id_deposito")]
        public Deposito Deposito { get; set; } = default!;

        [ForeignKey("id_producto")]
        public Producto Producto { get; set; } = default!;
    }
}
