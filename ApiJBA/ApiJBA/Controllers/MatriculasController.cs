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
    [Route("api/matriculas")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class MatriculasController : ControllerBase
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;

        public MatriculasController(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult<List<Matricula>>> Get()
        {
            var matriculas = await context.Matriculas.AsNoTracking().ToListAsync();
            return Ok(matriculas);
        }

        [HttpPost]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Post(MatriculaCreacionDto dto)
        {
            // Validar personal
            var existePersonal = await context.Personal.AnyAsync(x => x.ci_p == dto.ci_p);
            if (!existePersonal)
            {
                return BadRequest($"El personal con cédula {dto.ci_p} no existe.");
            }

            var matricula = mapper.Map<Matricula>(dto);
            context.Matriculas.Add(matricula);
            await context.SaveChangesAsync();
            return Ok(matricula);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Put(int id, MatriculaCreacionDto dto)
        {
            var matricula = await context.Matriculas.FindAsync(id);
            if (matricula == null)
            {
                return NotFound($"La matrícula con el ID {id} no existe.");
            }

            var existePersonal = await context.Personal.AnyAsync(x => x.ci_p == dto.ci_p);
            if (!existePersonal)
            {
                return BadRequest($"El personal con cédula {dto.ci_p} no existe.");
            }

            matricula.seccion = dto.seccion;
            matricula.aula = dto.aula;
            matricula.turno = dto.turno;
            matricula.ci_p = dto.ci_p;
            matricula.capacidad = dto.capacidad;
            matricula.varones = dto.varones;
            matricula.hembras = dto.hembras;
            matricula.estado_m = dto.estado_m;
            matricula.motivo_m = dto.motivo_m;

            await context.SaveChangesAsync();
            return NoContent();
        }
    }
}
