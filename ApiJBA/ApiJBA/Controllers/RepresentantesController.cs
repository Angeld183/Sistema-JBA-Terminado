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
    [Route("api/representantes")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class RepresentantesController : ControllerBase
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;

        public RepresentantesController(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult<List<Representante>>> Get()
        {
            var representantes = await context.Representantes.AsNoTracking().ToListAsync();
            return Ok(representantes);
        }

        [HttpPost]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Post(RepresentanteCreacionDto dto)
        {
            // Validar si ya existe
            var existe = await context.Representantes.AnyAsync(x => x.ci_representante == dto.ci_representante);
            if (existe)
            {
                return BadRequest($"Ya existe un representante registrado con la cédula: {dto.ci_representante}");
            }

            var representante = mapper.Map<Representante>(dto);
            context.Representantes.Add(representante);
            await context.SaveChangesAsync();
            return Ok(representante);
        }

        [HttpPut("{ci}")]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Put(string ci, RepresentanteCreacionDto dto)
        {
            var representante = await context.Representantes.FindAsync(ci);
            if (representante == null)
            {
                return NotFound($"El representante con cédula {ci} no existe.");
            }

            representante.nombre_representante = dto.nombre_representante;
            representante.ci_padre = dto.ci_padre;
            representante.ci_madre = dto.ci_madre;
            representante.nombre_padre = dto.nombre_padre;
            representante.nombre_madre = dto.nombre_madre;
            representante.motivo_r = dto.motivo_r;
            representante.estado_representante = dto.estado_representante;
            representante.hijos = dto.hijos;
            representante.carta_residencia = dto.carta_residencia;

            await context.SaveChangesAsync();
            return Ok(representante);
        }
    }
}
