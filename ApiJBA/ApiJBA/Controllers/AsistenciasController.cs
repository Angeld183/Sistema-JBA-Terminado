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
    [Route("api/asistencias")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class AsistenciasController : ControllerBase
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;

        public AsistenciasController(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult<List<Asistencia>>> Get()
        {
            var asistencias = await context.Asistencias.AsNoTracking().ToListAsync();
            return Ok(asistencias);
        }

        [HttpPost]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Post(AsistenciaCreacionDto dto)
        {
            // Validar que el personal exista
            var existePersonal = await context.Personal.AnyAsync(x => x.ci_p == dto.ci_p);
            if (!existePersonal)
            {
                return BadRequest($"El personal con la cédula {dto.ci_p} no existe.");
            }

            var asistencia = mapper.Map<Asistencia>(dto);
            context.Asistencias.Add(asistencia);
            await context.SaveChangesAsync();
            return Ok(asistencia);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Put(int id, AsistenciaCreacionDto dto)
        {
            var asistencia = await context.Asistencias.FindAsync(id);
            if (asistencia == null)
            {
                return NotFound($"No se encontró el registro de asistencia con el ID {id}.");
            }

            asistencia.salida = dto.salida;
            await context.SaveChangesAsync();
            return Ok(asistencia);
        }
    }
}
