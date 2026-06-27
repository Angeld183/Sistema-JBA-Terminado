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
    [Route("api/recepciones")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class RecepcionesController : ControllerBase
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;

        public RecepcionesController(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult<List<Recepcion>>> Get()
        {
            var recepciones = await context.Recepciones.AsNoTracking().ToListAsync();
            return Ok(recepciones);
        }

        [HttpPost]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Post(RecepcionCreacionDto dto)
        {
            // Validar dependencias
            var existeOrden = await context.Colaboraciones.AnyAsync(x => x.id_orden == dto.id_orden);
            if (!existeOrden)
            {
                return BadRequest($"La orden de colaboración con ID {dto.id_orden} no existe.");
            }

            var existePersonal = await context.Personal.AnyAsync(x => x.ci_p == dto.ci_p);
            if (!existePersonal)
            {
                return BadRequest($"El personal con cédula {dto.ci_p} no existe.");
            }

            var recepcion = mapper.Map<Recepcion>(dto);
            context.Recepciones.Add(recepcion);
            await context.SaveChangesAsync();
            return Ok(recepcion);
        }
    }
}
