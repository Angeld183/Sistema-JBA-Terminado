using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ApiJBA.Entidades
{
    [Table("representantes")]
    public class Representante
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Column(TypeName = "varchar(20)")]
        [StringLength(20)]
        public string ci_representante { get; set; } = default!;

        [Column(TypeName = "varchar(20)")]
        [StringLength(20)]
        public string? ci_padre { get; set; }

        [Column(TypeName = "varchar(20)")]
        [StringLength(20)]
        public string? ci_madre { get; set; }

        [Required]
        [Column(TypeName = "varchar(100)")]
        [StringLength(100)]
        public string nombre_representante { get; set; } = default!;

        [Column(TypeName = "varchar(100)")]
        [StringLength(100)]
        public string? nombre_padre { get; set; }

        [Column(TypeName = "varchar(100)")]
        [StringLength(100)]
        public string? nombre_madre { get; set; }

        [Column(TypeName = "varchar(255)")]
        [StringLength(255)]
        public string? foto_padre { get; set; }

        [Column(TypeName = "varchar(255)")]
        [StringLength(255)]
        public string? foto_madre { get; set; }

        [Required]
        public DateTime fecha_registro { get; set; }

        public DateTime? fecha_salida { get; set; }

        [Required]
        public int estado_representante { get; set; }

        [Column(TypeName = "varchar(255)")]
        [StringLength(255)]
        public string? motivo_r { get; set; }

        [Required]
        public int hijos { get; set; }

        [Column(TypeName = "varchar(255)")]
        [StringLength(255)]
        public string? carta_residencia { get; set; }

        // Propiedades de navegación
        public ICollection<Alumno> Alumnos { get; set; } = new List<Alumno>();
        public ICollection<Colaboracion> Colaboraciones { get; set; } = new List<Colaboracion>();
    }
}
