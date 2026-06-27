using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiJBA.DTOs;
using ApiJBA.Entidades;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace ApiJBA.Controllers
{
    [ApiController]
    [Route("api/alumnos")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class AlumnosController : ControllerBase
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;

        public AlumnosController(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult<List<Alumno>>> Get()
        {
            var alumnos = await context.Alumnos.AsNoTracking().ToListAsync();
            return Ok(alumnos);
        }

        [HttpPost]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Post(AlumnoCreacionDto dto)
        {
            // Validar si ya existe el alumno con la misma cédula
            var existe = await context.Alumnos.AnyAsync(x => x.ci_alumno == dto.ci_alumno);
            if (existe)
            {
                return BadRequest($"Ya existe un alumno registrado con la cédula: {dto.ci_alumno}");
            }

            var alumno = mapper.Map<Alumno>(dto);
            context.Alumnos.Add(alumno);
            await context.SaveChangesAsync();
            return Ok(alumno);
        }

        [HttpDelete("{ci}")]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Delete(string ci)
        {
            var alumno = await context.Alumnos.FindAsync(ci);
            if (alumno == null)
            {
                return NotFound($"El alumno con cédula {ci} no existe.");
            }
            context.Alumnos.Remove(alumno);
            await context.SaveChangesAsync();
            return Ok(new { mensaje = $"Alumno con cédula {ci} eliminado exitosamente." });
        }

        [HttpPut("{ci}")]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Put(string ci, AlumnoCreacionDto dto)
        {
            var alumno = await context.Alumnos.FindAsync(ci);
            if (alumno == null)
            {
                return NotFound($"El alumno con cédula {ci} no existe.");
            }

            alumno.nombre_alumno = dto.nombre_alumno;
            alumno.estado_alumno = dto.estado_alumno;
            alumno.motivo_a = dto.motivo_a;
            alumno.edad_alumno = dto.edad_alumno;
            alumno.sexo = dto.sexo;
            alumno.cardiovascular = dto.cardiovascular;
            alumno.partida_nacimiento = dto.partida_nacimiento;
            alumno.ci_representante = dto.ci_representante;

            await context.SaveChangesAsync();
            return Ok(alumno);
        }

        [HttpPost("promocionar")]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Promocionar()
        {
            try
            {
                var inscripciones = await context.Inscripciones.ToListAsync();
                var matriculas = await context.Matriculas.ToListAsync();
                var alumnos = await context.Alumnos.ToListAsync();

                foreach (var insc in inscripciones)
                {
                    var matriculaActual = matriculas.Find(m => m.id_aula == insc.id_aula);
                    if (matriculaActual == null) continue;

                    var alumno = alumnos.Find(a => a.ci_alumno == insc.ci_alumno);
                    if (alumno == null) continue;

                    // Si es Sala de 5 Años, se gradúa (egresa) y se le da de baja en inscripciones
                    if (matriculaActual.aula.Contains("5"))
                    {
                        alumno.estado_alumno = 0; // Inactivo / Graduado
                        alumno.motivo_a = "Graduado / Egresado";
                        alumno.fecha_salida_a = DateTime.Now;
                        
                        context.Inscripciones.Remove(insc);
                    }
                    else
                    {
                        // Determinar siguiente aula (Sala 3 -> Sala 4 -> Sala 5)
                        string siguienteAulaNum = matriculaActual.aula.Contains("3") ? "4" : "5";
                        var siguienteMatricula = matriculas.Find(m => 
                            m.aula.Contains(siguienteAulaNum) && 
                            m.seccion.ToLower().Trim() == matriculaActual.seccion.ToLower().Trim()
                        );

                        // Si no encuentra la misma sección, busca cualquier sección de ese nivel
                        if (siguienteMatricula == null)
                        {
                            siguienteMatricula = matriculas.Find(m => m.aula.Contains(siguienteAulaNum));
                        }

                        if (siguienteMatricula != null)
                        {
                            insc.id_aula = siguienteMatricula.id_aula;
                            alumno.edad_alumno += 1;
                            alumno.motivo_a = $"Promovido de Sala { (siguienteAulaNum == "4" ? "3" : "4") } a Sala {siguienteAulaNum}";
                        }
                    }
                }

                await context.SaveChangesAsync();
                return Ok(new { mensaje = "Promoción de año escolar ejecutada con éxito." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { title = "Error Interno", mensaje = ex.Message, stack = ex.StackTrace });
            }
        }
    }
}
