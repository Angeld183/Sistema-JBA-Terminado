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
    [Route("api/colaboraciones")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ColaboracionesController : ControllerBase
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;

        public ColaboracionesController(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult<List<Colaboracion>>> Get()
        {
            var colaboraciones = await context.Colaboraciones.AsNoTracking().ToListAsync();
            return Ok(colaboraciones);
        }

        [HttpPost]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Post(ColaboracionCreacionDto dto)
        {
            // Validar que se provea al menos un proveedor o un representante colaborador
            if (dto.id_proveedor == null && string.IsNullOrEmpty(dto.ci_representante))
            {
                return BadRequest("Debe especificar al menos un proveedor o un colaborador (representante).");
            }

            // Validar dependencias si están presentes
            if (dto.id_proveedor != null)
            {
                var existeProveedor = await context.Proveedores.AnyAsync(x => x.id_proveedor == dto.id_proveedor);
                if (!existeProveedor)
                {
                    return BadRequest($"El proveedor con ID {dto.id_proveedor} no existe.");
                }
            }

            if (!string.IsNullOrEmpty(dto.ci_representante))
            {
                var existeRepresentante = await context.Representantes.AnyAsync(x => x.ci_representante == dto.ci_representante);
                if (!existeRepresentante)
                {
                    return BadRequest($"El representante con cédula {dto.ci_representante} no existe.");
                }
            }

            var existePersonal = await context.Personal.AnyAsync(x => x.ci_p == dto.ci_p);
            if (!existePersonal)
            {
                return BadRequest($"El personal con cédula {dto.ci_p} no existe.");
            }

            var colaboracion = mapper.Map<Colaboracion>(dto);
            context.Colaboraciones.Add(colaboracion);
            await context.SaveChangesAsync();
            return Ok(colaboracion);
        }
    }
}
