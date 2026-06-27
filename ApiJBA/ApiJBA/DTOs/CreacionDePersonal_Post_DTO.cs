using System;
using System.ComponentModel.DataAnnotations;

namespace ApiJBA.DTOs
{
    public class CreacionDePersonal_Post_DTO
    {
        [Required]
        [StringLength(16)]
        public string ci_p { get; set; } = default!;

        [Required]
        [StringLength(50)]
        public string nombre_p { get; set; } = default!;

        [Required(ErrorMessage = "La contraseña es obligatoria.")]
        [StringLength(255)]
        public string contrasena { get; set; } = default!;

        [Required]
        [Range(1, 10, ErrorMessage = "El nivel debe estar entre 1 y 10 (1=Personal General, 6=Vocero, 7=Secretaria, 8=Subdirector, 9=Director, 10=Sistemas).")]
        public int nivel { get; set; }

        [Required]
        public bool estado { get; set; }

        [StringLength(25)]
        public string? cargo { get; set; } // Puede ser nulo en la petición para que el backend lo asigne automáticamente según el nivel

        [Required]
        public DateTime fecha_registro { get; set; }

        public DateTime? fecha_salida { get; set; }

        [Required]
        [StringLength(50)]
        public string direccion_p { get; set; } = default!;

        [StringLength(25)]
        public string? correo_p { get; set; }

        [StringLength(255)]
        public string? foto_p { get; set; }

        public DateTime? fecha_voucher { get; set; }

        [StringLength(255)]
        public string? tipo_preparacion { get; set; }

        public string? modulos_asignados { get; set; }
    }
}
