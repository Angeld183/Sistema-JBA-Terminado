using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ApiJBA.Entidades
{
    [Table("matriculas")]
    public class Matricula
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_aula { get; set; }

        [Required]
        [Column(TypeName = "varchar(10)")]
        [StringLength(10)]
        public string seccion { get; set; } = default!;

        [Required]
        [Column(TypeName = "varchar(50)")]
        [StringLength(50)]
        public string aula { get; set; } = default!;

        [Required]
        [Column(TypeName = "varchar(20)")]
        [StringLength(20)]
        public string turno { get; set; } = default!;

        [Required]
        [Column(TypeName = "varchar(16)")]
        [StringLength(16)]
        public string ci_p { get; set; } = default!;

        [Required]
        public int capacidad { get; set; }

        [Required]
        public int varones { get; set; }

        [Required]
        public int hembras { get; set; }

        [Required]
        public int estado_m { get; set; }

        [Column(TypeName = "varchar(255)")]
        [StringLength(255)]
        public string? motivo_m { get; set; }

        // Propiedades de navegación
        [ForeignKey("ci_p")]
        public Personal Personal { get; set; } = default!;

        public ICollection<Inscripcion> Inscripciones { get; set; } = new List<Inscripcion>();
    }
}
