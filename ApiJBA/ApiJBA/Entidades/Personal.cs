using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ApiJBA.Entidades
{
    [Table("personal")]
    public class Personal
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Required]
        [Column(TypeName = "varchar(16)")]
        [StringLength(16)]
        public string ci_p { get; set; } = default!;

        [Required]
        [Column(TypeName = "varchar(50)")]
        [StringLength(50)]
        public string nombre_p { get; set; } = default!;

        [Required]
        [Column(TypeName = "varchar(255)")]
        [StringLength(255)]
        public string contrasena { get; set; } = default!;

        [Required]
        public int nivel { get; set; }

        [Required]
        public bool estado { get; set; }

        [Required]
        [Column(TypeName = "varchar(25)")]
        [StringLength(25)]
        public string cargo { get; set; } = default!;

        [Required]
        public DateTime fecha_registro { get; set; }

        public DateTime? fecha_salida { get; set; }

        [Required]
        [Column(TypeName = "varchar(50)")]
        [StringLength(50)]
        public string direccion_p { get; set; } = default!;

        [Column(TypeName = "varchar(25)")]
        [StringLength(25)]
        public string? correo_p { get; set; }

        [Column(TypeName = "varchar(255)")]
        [StringLength(255)]
        public string? foto_p { get; set; }

        public DateTime? fecha_voucher { get; set; }

        [Column(TypeName = "varchar(255)")]
        [StringLength(255)]
        public string? tipo_preparacion { get; set; }

        [Column(TypeName = "varchar(500)")]
        [StringLength(500)]
        public string? modulos_asignados { get; set; }

        // Propiedad de navegación (Relación 1 a muchos con Operaciones)
        public ICollection<Operacion> Operaciones { get; set; } = new List<Operacion>();

        public ICollection<Colaboracion> Colaboraciones { get; set; } = new List<Colaboracion>();
        public ICollection<Recepcion> Recepciones { get; set; } = new List<Recepcion>();
        public ICollection<Matricula> Matriculas { get; set; } = new List<Matricula>();
        public ICollection<Asistencia> Asistencias { get; set; } = new List<Asistencia>();
        public ICollection<Traslado> Traslados { get; set; } = new List<Traslado>();
    }
}
