using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiJBA.Entidades
{
    [Table("inscripciones")]
    public class Inscripcion
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_inscripcion { get; set; }

        [Required]
        public int id_aula { get; set; }

        [Required]
        [Column(TypeName = "varchar(20)")]
        [StringLength(20)]
        public string ci_alumno { get; set; } = default!;

        [Required]
        public DateTime fecha_inscripcion { get; set; }

        // Propiedades de navegación
        [ForeignKey("id_aula")]
        public Matricula Matricula { get; set; } = default!;

        [ForeignKey("ci_alumno")]
        public Alumno Alumno { get; set; } = default!;
    }
}
