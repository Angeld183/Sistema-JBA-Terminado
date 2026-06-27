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
    [Route("api/inscripciones")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class InscripcionesController : ControllerBase
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;

        public InscripcionesController(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult<List<Inscripcion>>> Get()
        {
            var inscripciones = await context.Inscripciones.AsNoTracking().ToListAsync();
            return Ok(inscripciones);
        }

        [HttpPost]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Post(InscripcionCreacionDto dto)
        {
            // Validar dependencias
            var existeMatricula = await context.Matriculas.AnyAsync(x => x.id_aula == dto.id_aula);
            if (!existeMatricula)
            {
                return BadRequest($"La matrícula/aula con ID {dto.id_aula} no existe.");
            }

            var existeAlumno = await context.Alumnos.AnyAsync(x => x.ci_alumno == dto.ci_alumno);
            if (!existeAlumno)
            {
                return BadRequest($"El alumno con cédula {dto.ci_alumno} no existe.");
            }

            var inscripcion = mapper.Map<Inscripcion>(dto);
            context.Inscripciones.Add(inscripcion);
            await context.SaveChangesAsync();
            return Ok(inscripcion);
        }
    }
}
