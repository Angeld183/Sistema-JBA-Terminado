using System.ComponentModel.DataAnnotations;

namespace ApiJBA.DTOs
{
    public class LoginDto
    {
        [Required(ErrorMessage = "La cédula (ci_p) es requerida para iniciar sesión.")]
        [StringLength(20, ErrorMessage = "La cédula no puede superar los 20 caracteres.")]
        public string ci_p { get; set; } = default!;

        [Required(ErrorMessage = "La contraseña es requerida para iniciar sesión.")]
        [StringLength(255, ErrorMessage = "La contraseña no puede superar los 255 caracteres.")]
        public string contrasena { get; set; } = default!;
    }
}
