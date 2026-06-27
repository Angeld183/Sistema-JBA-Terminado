using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiJBA.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "categoria",
                columns: table => new
                {
                    id_categoria = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombre_categoria = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_categoria", x => x.id_categoria);
                });

            migrationBuilder.CreateTable(
                name: "depositos",
                columns: table => new
                {
                    id_deposito = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombre_d = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true),
                    fecha_registro = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_depositos", x => x.id_deposito);
                });

            migrationBuilder.CreateTable(
                name: "personal",
                columns: table => new
                {
                    ci_p = table.Column<string>(type: "varchar(16)", maxLength: 16, nullable: false),
                    nombre_p = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    nivel = table.Column<int>(type: "int", nullable: false),
                    estado = table.Column<bool>(type: "bit", nullable: false),
                    cargo = table.Column<string>(type: "varchar(25)", maxLength: 25, nullable: false),
                    fecha_registro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    fecha_salida = table.Column<DateTime>(type: "datetime2", nullable: true),
                    direccion_p = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    correo_p = table.Column<string>(type: "varchar(25)", maxLength: 25, nullable: true),
                    foto_p = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true),
                    fecha_voucher = table.Column<DateTime>(type: "datetime2", nullable: true),
                    tipo_preparacion = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_personal", x => x.ci_p);
                });

            migrationBuilder.CreateTable(
                name: "proveedor",
                columns: table => new
                {
                    id_proveedor = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombre_proveedor = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    num_proveedor = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_proveedor", x => x.id_proveedor);
                });

            migrationBuilder.CreateTable(
                name: "representantes",
                columns: table => new
                {
                    ci_representante = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    ci_padre = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true),
                    ci_madre = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true),
                    nombre_representante = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    nombre_padre = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true),
                    nombre_madre = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true),
                    foto_padre = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true),
                    foto_madre = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true),
                    fecha_registro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    fecha_salida = table.Column<DateTime>(type: "datetime2", nullable: true),
                    estado_representante = table.Column<int>(type: "int", nullable: false),
                    motivo_r = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true),
                    hijos = table.Column<int>(type: "int", nullable: false),
                    carta_residencia = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_representantes", x => x.ci_representante);
                });

            migrationBuilder.CreateTable(
                name: "producto",
                columns: table => new
                {
                    id_producto = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_categoria = table.Column<int>(type: "int", nullable: false),
                    codigo_corto = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    descripcion = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    cant_min = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_producto", x => x.id_producto);
                    table.ForeignKey(
                        name: "FK_producto_categoria_id_categoria",
                        column: x => x.id_categoria,
                        principalTable: "categoria",
                        principalColumn: "id_categoria",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "asistencias",
                columns: table => new
                {
                    id_dia = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ci_p = table.Column<string>(type: "varchar(16)", maxLength: 16, nullable: false),
                    entrada = table.Column<DateTime>(type: "datetime2", nullable: false),
                    salida = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_asistencias", x => x.id_dia);
                    table.ForeignKey(
                        name: "FK_asistencias_personal_ci_p",
                        column: x => x.ci_p,
                        principalTable: "personal",
                        principalColumn: "ci_p",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "matriculas",
                columns: table => new
                {
                    id_aula = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    seccion = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false),
                    aula = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    turno = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    ci_p = table.Column<string>(type: "varchar(16)", maxLength: 16, nullable: false),
                    capacidad = table.Column<int>(type: "int", nullable: false),
                    varones = table.Column<int>(type: "int", nullable: false),
                    hembras = table.Column<int>(type: "int", nullable: false),
                    estado_m = table.Column<int>(type: "int", nullable: false),
                    motivo_m = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_matriculas", x => x.id_aula);
                    table.ForeignKey(
                        name: "FK_matriculas_personal_ci_p",
                        column: x => x.ci_p,
                        principalTable: "personal",
                        principalColumn: "ci_p",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "operaciones",
                columns: table => new
                {
                    id_operacion = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ci_p = table.Column<string>(type: "varchar(16)", maxLength: 20, nullable: false),
                    fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    registro_id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    tipo_operacion = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_operaciones", x => x.id_operacion);
                    table.ForeignKey(
                        name: "FK_operaciones_personal_ci_p",
                        column: x => x.ci_p,
                        principalTable: "personal",
                        principalColumn: "ci_p",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "alumnos",
                columns: table => new
                {
                    ci_alumno = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    nombre_alumno = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    estado_alumno = table.Column<int>(type: "int", nullable: false),
                    motivo_a = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true),
                    fecha_registro_a = table.Column<DateTime>(type: "datetime2", nullable: false),
                    fecha_salida_a = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ci_representante = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    edad_alumno = table.Column<int>(type: "int", nullable: false),
                    foto_a = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true),
                    partida_nacimiento = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true),
                    sexo = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false),
                    cardiovascular = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_alumnos", x => x.ci_alumno);
                    table.ForeignKey(
                        name: "FK_alumnos_representantes_ci_representante",
                        column: x => x.ci_representante,
                        principalTable: "representantes",
                        principalColumn: "ci_representante",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "colaboraciones",
                columns: table => new
                {
                    id_orden = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_proveedor = table.Column<int>(type: "int", nullable: false),
                    ci_representante = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    ci_p = table.Column<string>(type: "varchar(16)", maxLength: 16, nullable: false),
                    fecha_registro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    observacion = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_colaboraciones", x => x.id_orden);
                    table.ForeignKey(
                        name: "FK_colaboraciones_personal_ci_p",
                        column: x => x.ci_p,
                        principalTable: "personal",
                        principalColumn: "ci_p",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_colaboraciones_proveedor_id_proveedor",
                        column: x => x.id_proveedor,
                        principalTable: "proveedor",
                        principalColumn: "id_proveedor",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_colaboraciones_representantes_ci_representante",
                        column: x => x.ci_representante,
                        principalTable: "representantes",
                        principalColumn: "ci_representante",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "stock_deposito",
                columns: table => new
                {
                    id_stock = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_deposito = table.Column<int>(type: "int", nullable: false),
                    id_producto = table.Column<int>(type: "int", nullable: false),
                    cantidad = table.Column<int>(type: "int", nullable: false),
                    cantidad_min = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_deposito", x => x.id_stock);
                    table.ForeignKey(
                        name: "FK_stock_deposito_depositos_id_deposito",
                        column: x => x.id_deposito,
                        principalTable: "depositos",
                        principalColumn: "id_deposito",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_stock_deposito_producto_id_producto",
                        column: x => x.id_producto,
                        principalTable: "producto",
                        principalColumn: "id_producto",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "traslados",
                columns: table => new
                {
                    id_tr = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_dep_origen = table.Column<int>(type: "int", nullable: false),
                    id_dep_destino = table.Column<int>(type: "int", nullable: false),
                    id_producto = table.Column<int>(type: "int", nullable: false),
                    cantidad_tr = table.Column<int>(type: "int", nullable: false),
                    ci_p = table.Column<string>(type: "varchar(16)", maxLength: 16, nullable: false),
                    fecha_tr = table.Column<DateTime>(type: "datetime2", nullable: false),
                    motivo = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_traslados", x => x.id_tr);
                    table.ForeignKey(
                        name: "FK_traslados_depositos_id_dep_destino",
                        column: x => x.id_dep_destino,
                        principalTable: "depositos",
                        principalColumn: "id_deposito",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_traslados_depositos_id_dep_origen",
                        column: x => x.id_dep_origen,
                        principalTable: "depositos",
                        principalColumn: "id_deposito",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_traslados_personal_ci_p",
                        column: x => x.ci_p,
                        principalTable: "personal",
                        principalColumn: "ci_p",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_traslados_producto_id_producto",
                        column: x => x.id_producto,
                        principalTable: "producto",
                        principalColumn: "id_producto",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "inscripciones",
                columns: table => new
                {
                    id_inscripcion = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_aula = table.Column<int>(type: "int", nullable: false),
                    ci_alumno = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    fecha_inscripcion = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_inscripciones", x => x.id_inscripcion);
                    table.ForeignKey(
                        name: "FK_inscripciones_alumnos_ci_alumno",
                        column: x => x.ci_alumno,
                        principalTable: "alumnos",
                        principalColumn: "ci_alumno",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_inscripciones_matriculas_id_aula",
                        column: x => x.id_aula,
                        principalTable: "matriculas",
                        principalColumn: "id_aula",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "detalle_colaboracion",
                columns: table => new
                {
                    id_detalle = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_orden = table.Column<int>(type: "int", nullable: false),
                    id_producto = table.Column<int>(type: "int", nullable: false),
                    cant_soli = table.Column<int>(type: "int", nullable: false),
                    id_deposito = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_detalle_colaboracion", x => x.id_detalle);
                    table.ForeignKey(
                        name: "FK_detalle_colaboracion_colaboraciones_id_orden",
                        column: x => x.id_orden,
                        principalTable: "colaboraciones",
                        principalColumn: "id_orden",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_detalle_colaboracion_depositos_id_deposito",
                        column: x => x.id_deposito,
                        principalTable: "depositos",
                        principalColumn: "id_deposito",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_detalle_colaboracion_producto_id_producto",
                        column: x => x.id_producto,
                        principalTable: "producto",
                        principalColumn: "id_producto",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "recepcion",
                columns: table => new
                {
                    id_recepcion = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_orden = table.Column<int>(type: "int", nullable: false),
                    ci_p = table.Column<string>(type: "varchar(16)", maxLength: 16, nullable: false),
                    fecha_registro = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recepcion", x => x.id_recepcion);
                    table.ForeignKey(
                        name: "FK_recepcion_colaboraciones_id_orden",
                        column: x => x.id_orden,
                        principalTable: "colaboraciones",
                        principalColumn: "id_orden",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_recepcion_personal_ci_p",
                        column: x => x.ci_p,
                        principalTable: "personal",
                        principalColumn: "ci_p",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "detalle_recepcion",
                columns: table => new
                {
                    id_detalle_rec = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_recepcion = table.Column<int>(type: "int", nullable: false),
                    id_producto = table.Column<int>(type: "int", nullable: false),
                    cantidad_re = table.Column<int>(type: "int", nullable: false),
                    fecha_vencimiento = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_detalle_recepcion", x => x.id_detalle_rec);
                    table.ForeignKey(
                        name: "FK_detalle_recepcion_producto_id_producto",
                        column: x => x.id_producto,
                        principalTable: "producto",
                        principalColumn: "id_producto",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_detalle_recepcion_recepcion_id_recepcion",
                        column: x => x.id_recepcion,
                        principalTable: "recepcion",
                        principalColumn: "id_recepcion",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_alumnos_ci_representante",
                table: "alumnos",
                column: "ci_representante");

            migrationBuilder.CreateIndex(
                name: "IX_asistencias_ci_p",
                table: "asistencias",
                column: "ci_p");

            migrationBuilder.CreateIndex(
                name: "IX_colaboraciones_ci_p",
                table: "colaboraciones",
                column: "ci_p");

            migrationBuilder.CreateIndex(
                name: "IX_colaboraciones_ci_representante",
                table: "colaboraciones",
                column: "ci_representante");

            migrationBuilder.CreateIndex(
                name: "IX_colaboraciones_id_proveedor",
                table: "colaboraciones",
                column: "id_proveedor");

            migrationBuilder.CreateIndex(
                name: "IX_detalle_colaboracion_id_deposito",
                table: "detalle_colaboracion",
                column: "id_deposito");

            migrationBuilder.CreateIndex(
                name: "IX_detalle_colaboracion_id_orden",
                table: "detalle_colaboracion",
                column: "id_orden");

            migrationBuilder.CreateIndex(
                name: "IX_detalle_colaboracion_id_producto",
                table: "detalle_colaboracion",
                column: "id_producto");

            migrationBuilder.CreateIndex(
                name: "IX_detalle_recepcion_id_producto",
                table: "detalle_recepcion",
                column: "id_producto");

            migrationBuilder.CreateIndex(
                name: "IX_detalle_recepcion_id_recepcion",
                table: "detalle_recepcion",
                column: "id_recepcion");

            migrationBuilder.CreateIndex(
                name: "IX_inscripciones_ci_alumno",
                table: "inscripciones",
                column: "ci_alumno");

            migrationBuilder.CreateIndex(
                name: "IX_inscripciones_id_aula",
                table: "inscripciones",
                column: "id_aula");

            migrationBuilder.CreateIndex(
                name: "IX_matriculas_ci_p",
                table: "matriculas",
                column: "ci_p");

            migrationBuilder.CreateIndex(
                name: "IX_operaciones_ci_p",
                table: "operaciones",
                column: "ci_p");

            migrationBuilder.CreateIndex(
                name: "IX_producto_id_categoria",
                table: "producto",
                column: "id_categoria");

            migrationBuilder.CreateIndex(
                name: "IX_recepcion_ci_p",
                table: "recepcion",
                column: "ci_p");

            migrationBuilder.CreateIndex(
                name: "IX_recepcion_id_orden",
                table: "recepcion",
                column: "id_orden",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_stock_deposito_id_deposito",
                table: "stock_deposito",
                column: "id_deposito");

            migrationBuilder.CreateIndex(
                name: "IX_stock_deposito_id_producto",
                table: "stock_deposito",
                column: "id_producto");

            migrationBuilder.CreateIndex(
                name: "IX_traslados_ci_p",
                table: "traslados",
                column: "ci_p");

            migrationBuilder.CreateIndex(
                name: "IX_traslados_id_dep_destino",
                table: "traslados",
                column: "id_dep_destino");

            migrationBuilder.CreateIndex(
                name: "IX_traslados_id_dep_origen",
                table: "traslados",
                column: "id_dep_origen");

            migrationBuilder.CreateIndex(
                name: "IX_traslados_id_producto",
                table: "traslados",
                column: "id_producto");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "asistencias");

            migrationBuilder.DropTable(
                name: "detalle_colaboracion");

            migrationBuilder.DropTable(
                name: "detalle_recepcion");

            migrationBuilder.DropTable(
                name: "inscripciones");

            migrationBuilder.DropTable(
                name: "operaciones");

            migrationBuilder.DropTable(
                name: "stock_deposito");

            migrationBuilder.DropTable(
                name: "traslados");

            migrationBuilder.DropTable(
                name: "recepcion");

            migrationBuilder.DropTable(
                name: "alumnos");

            migrationBuilder.DropTable(
                name: "matriculas");

            migrationBuilder.DropTable(
                name: "depositos");

            migrationBuilder.DropTable(
                name: "producto");

            migrationBuilder.DropTable(
                name: "colaboraciones");

            migrationBuilder.DropTable(
                name: "categoria");

            migrationBuilder.DropTable(
                name: "personal");

            migrationBuilder.DropTable(
                name: "proveedor");

            migrationBuilder.DropTable(
                name: "representantes");
        }
    }
}
