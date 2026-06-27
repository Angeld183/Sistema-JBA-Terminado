using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiJBA.Entidades
{
    [Table("asistencias")]
    public class Asistencia
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_dia { get; set; }

        [Required]
        [Column(TypeName = "varchar(16)")]
        [StringLength(16)]
        public string ci_p { get; set; } = default!;

        [Required]
        public DateTime entrada { get; set; }

        public DateTime? salida { get; set; }

        // Propiedades de navegación
        [ForeignKey("ci_p")]
        public Personal Personal { get; set; } = default!;
    }
}
