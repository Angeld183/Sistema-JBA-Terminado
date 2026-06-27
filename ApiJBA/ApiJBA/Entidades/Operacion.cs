using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiJBA.Entidades
{
    [Table("operaciones")]
    public class Operacion
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_operacion { get; set; }

        [Required]
        [StringLength(20)]
        public string ci_p { get; set; } = default!;

        [Required]
        public DateTime fecha { get; set; }

        [Required]
        [StringLength(100)] // Agregué un límite por defecto, se puede ajustar
        public string registro_id { get; set; } = default!;

        [Required]
        [StringLength(25)]
        public string tipo_operacion { get; set; } = default!;

        // Propiedad de navegación
        [ForeignKey("ci_p")]
        public Personal Personal { get; set; } = default!;
    }
}
