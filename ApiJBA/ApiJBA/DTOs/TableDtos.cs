using System;
using System.ComponentModel.DataAnnotations;

namespace ApiJBA.DTOs
{
    // 1. Alumno
    public class AlumnoCreacionDto
    {
        [Required]
        [StringLength(20)]
        public string ci_alumno { get; set; } = default!;

        [Required]
        [StringLength(100)]
        public string nombre_alumno { get; set; } = default!;

        [Required]
        public int estado_alumno { get; set; }

        [StringLength(255)]
        public string? motivo_a { get; set; }

        [Required]
        public DateTime fecha_registro_a { get; set; }

        public DateTime? fecha_salida_a { get; set; }

        [Required]
        [StringLength(20)]
        public string ci_representante { get; set; } = default!;

        [Required]
        public int edad_alumno { get; set; }

        [StringLength(255)]
        public string? foto_a { get; set; }

        [StringLength(255)]
        public string? partida_nacimiento { get; set; }

        [Required]
        [StringLength(10)]
        public string sexo { get; set; } = default!;

        [StringLength(255)]
        public string? cardiovascular { get; set; }
    }

    // 2. Asistencia
    public class AsistenciaCreacionDto
    {
        [Required]
        [StringLength(16)]
        public string ci_p { get; set; } = default!;

        [Required]
        public DateTime entrada { get; set; }

        public DateTime? salida { get; set; }
    }

    // 3. Categoria
    public class CategoriaCreacionDto
    {
        [Required]
        [StringLength(100)]
        public string nombre_categoria { get; set; } = default!;
    }

    // 4. Colaboracion
    public class ColaboracionCreacionDto
    {
        [Required]
        public int id_proveedor { get; set; }

        [Required]
        [StringLength(20)]
        public string ci_representante { get; set; } = default!;

        [Required]
        [StringLength(16)]
        public string ci_p { get; set; } = default!;

        [Required]
        public DateTime fecha_registro { get; set; }

        [StringLength(255)]
        public string? observacion { get; set; }
    }

    // 5. Deposito
    public class DepositoCreacionDto
    {
        [StringLength(100)]
        public string? nombre_d { get; set; }

        public DateTime fecha_registro { get; set; } = DateTime.Now;
    }

    // 6. DetalleColaboracion
    public class DetalleColaboracionCreacionDto
    {
        [Required]
        public int id_orden { get; set; }

        [Required]
        public int id_producto { get; set; }

        [Required]
        public int cant_soli { get; set; }

        [Required]
        public int id_deposito { get; set; }
    }

    // 7. DetalleRecepcion
    public class DetalleRecepcionCreacionDto
    {
        [Required]
        public int id_recepcion { get; set; }

        [Required]
        public int id_producto { get; set; }

        [Required]
        public int cantidad_re { get; set; }

        public DateTime? fecha_vencimiento { get; set; }
    }

    // 8. Inscripcion
    public class InscripcionCreacionDto
    {
        [Required]
        public int id_aula { get; set; }

        [Required]
        [StringLength(20)]
        public string ci_alumno { get; set; } = default!;

        [Required]
        public DateTime fecha_inscripcion { get; set; }
    }

    // 9. Matricula
    public class MatriculaCreacionDto
    {
        [Required]
        [StringLength(10)]
        public string seccion { get; set; } = default!;

        [Required]
        [StringLength(50)]
        public string aula { get; set; } = default!;

        [Required]
        [StringLength(20)]
        public string turno { get; set; } = default!;

        [Required]
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

        [StringLength(255)]
        public string? motivo_m { get; set; }
    }

    // 10. Operacion
    public class OperacionCreacionDto
    {
        [Required]
        [StringLength(20)]
        public string ci_p { get; set; } = default!;

        [Required]
        public DateTime fecha { get; set; }

        [Required]
        [StringLength(100)]
        public string registro_id { get; set; } = default!;

        [Required]
        [StringLength(25)]
        public string tipo_operacion { get; set; } = default!;
    }

    // 11. Producto
    public class ProductoCreacionDto
    {
        [Required]
        public int id_categoria { get; set; }

        [Required]
        [StringLength(50)]
        public string codigo_corto { get; set; } = default!;

        [Required]
        [StringLength(255)]
        public string descripcion { get; set; } = default!;

        [Required]
        public int cant_min { get; set; }
    }

    // 12. Proveedor
    public class ProveedorCreacionDto
    {
        [Required]
        [StringLength(100)]
        public string nombre_proveedor { get; set; } = default!;

        [Required]
        [StringLength(50)]
        public string num_proveedor { get; set; } = default!;
    }

    // 13. Recepcion
    public class RecepcionCreacionDto
    {
        [Required]
        public int id_orden { get; set; }

        [Required]
        [StringLength(16)]
        public string ci_p { get; set; } = default!;

        [Required]
        public DateTime fecha_registro { get; set; }
    }

    // 14. Representante
    public class RepresentanteCreacionDto
    {
        [Required]
        [StringLength(20)]
        public string ci_representante { get; set; } = default!;

        [StringLength(20)]
        public string? ci_padre { get; set; }

        [StringLength(20)]
        public string? ci_madre { get; set; }

        [Required]
        [StringLength(100)]
        public string nombre_representante { get; set; } = default!;

        [StringLength(100)]
        public string? nombre_padre { get; set; }

        [StringLength(100)]
        public string? nombre_madre { get; set; }

        [StringLength(255)]
        public string? foto_padre { get; set; }

        [StringLength(255)]
        public string? foto_madre { get; set; }

        [Required]
        public DateTime fecha_registro { get; set; }

        public DateTime? fecha_salida { get; set; }

        [Required]
        public int estado_representante { get; set; }

        [StringLength(255)]
        public string? motivo_r { get; set; }

        [Required]
        public int hijos { get; set; }

        [StringLength(255)]
        public string? carta_residencia { get; set; }
    }

    // 15. StockDeposito
    public class StockDepositoCreacionDto
    {
        [Required]
        public int id_deposito { get; set; }

        [Required]
        public int id_producto { get; set; }

        [Required]
        public int cantidad { get; set; }

        [Required]
        public int cantidad_min { get; set; }
    }

    // 16. Traslado
    public class TrasladoCreacionDto
    {
        [Required]
        public int id_dep_origen { get; set; }

        [Required]
        public int id_dep_destino { get; set; }

        [Required]
        public int id_producto { get; set; }

        [Required]
        public int cantidad_tr { get; set; }

        [Required]
        [StringLength(16)]
        public string ci_p { get; set; } = default!;

        [Required]
        public DateTime fecha_tr { get; set; }

        [Required]
        [StringLength(255)]
        public string motivo { get; set; } = default!;
    }
}
