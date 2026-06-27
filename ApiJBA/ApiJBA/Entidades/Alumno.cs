using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ApiJBA.Entidades
{
    [Table("alumnos")]
    public class Alumno
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Column(TypeName = "varchar(20)")]
        [StringLength(20)]
        public string ci_alumno { get; set; } = default!;

        [Required]
        [Column(TypeName = "varchar(100)")]
        [StringLength(100)]
        public string nombre_alumno { get; set; } = default!;

        [Required]
        public int estado_alumno { get; set; }

        [Column(TypeName = "varchar(255)")]
        [StringLength(255)]
        public string? motivo_a { get; set; }

        [Required]
        public DateTime fecha_registro_a { get; set; }

        public DateTime? fecha_salida_a { get; set; }

        [Required]
        [Column(TypeName = "varchar(20)")]
        [StringLength(20)]
        public string ci_representante { get; set; } = default!;

        [Required]
        public int edad_alumno { get; set; }

        [Column(TypeName = "varchar(255)")]
        [StringLength(255)]
        public string? foto_a { get; set; }

        [Column(TypeName = "varchar(255)")]
        [StringLength(255)]
        public string? partida_nacimiento { get; set; }

        [Required]
        [Column(TypeName = "varchar(10)")]
        [StringLength(10)]
        public string sexo { get; set; } = default!;

        [Column(TypeName = "varchar(255)")]
        [StringLength(255)]
        public string? cardiovascular { get; set; }

        // Propiedades de navegación
        [ForeignKey("ci_representante")]
        public Representante Representante { get; set; } = default!;

        public ICollection<Inscripcion> Inscripciones { get; set; } = new List<Inscripcion>();
    }
}
