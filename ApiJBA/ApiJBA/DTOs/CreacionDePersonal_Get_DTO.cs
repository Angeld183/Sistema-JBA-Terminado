using System;

namespace ApiJBA.DTOs
{
    public class CreacionDePersonal_Get_DTO
    {
        public string ci_p { get; set; } = default!;
        public string nombre_p { get; set; } = default!;
        public int nivel { get; set; }
        public bool estado { get; set; }
        public string cargo { get; set; } = default!;
        public DateTime fecha_registro { get; set; }
        public DateTime? fecha_salida { get; set; }
        public string direccion_p { get; set; } = default!;
        public string? correo_p { get; set; }
        public string? foto_p { get; set; }
        public DateTime? fecha_voucher { get; set; }
        public string? contrasena { get; set; }

        public string? tipo_preparacion { get; set; }

        public string? modulos_asignados { get; set; }
    }
}
