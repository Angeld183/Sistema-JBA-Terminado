using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiJBA.Entidades
{
    [Table("traslados")]
    public class Traslado
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_tr { get; set; }

        [Required]
        public int id_dep_origen { get; set; }

        [Required]
        public int id_dep_destino { get; set; }

        [Required]
        public int id_producto { get; set; }

        [Required]
        public int cantidad_tr { get; set; }

        [Required]
        [Column(TypeName = "varchar(16)")]
        [StringLength(16)]
        public string ci_p { get; set; } = default!;

        [Required]
        public DateTime fecha_tr { get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")]
        [StringLength(255)]
        public string motivo { get; set; } = default!;

        // Propiedades de navegación
        [ForeignKey("id_dep_origen")]
        public Deposito DepositoOrigen { get; set; } = default!;

        [ForeignKey("id_dep_destino")]
        public Deposito DepositoDestino { get; set; } = default!;

        [ForeignKey("id_producto")]
        public Producto Producto { get; set; } = default!;

        [ForeignKey("ci_p")]
        public Personal Personal { get; set; } = default!;
    }
}
