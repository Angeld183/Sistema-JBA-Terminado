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
    [Route("api/detallecolaboraciones")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class DetalleColaboracionesController : ControllerBase
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;

        public DetalleColaboracionesController(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult<List<DetalleColaboracion>>> Get()
        {
            var detalles = await context.DetalleColaboraciones.AsNoTracking().ToListAsync();
            return Ok(detalles);
        }

        [HttpPost]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Post(DetalleColaboracionCreacionDto dto)
        {
            // Validar dependencias
            var existeOrden = await context.Colaboraciones.AnyAsync(x => x.id_orden == dto.id_orden);
            if (!existeOrden)
            {
                return BadRequest($"La orden de colaboración con ID {dto.id_orden} no existe.");
            }

            var existeProducto = await context.Productos.AnyAsync(x => x.id_producto == dto.id_producto);
            if (!existeProducto)
            {
                return BadRequest($"El producto con ID {dto.id_producto} no existe.");
            }

            var existeDeposito = await context.Depositos.AnyAsync(x => x.id_deposito == dto.id_deposito);
            if (!existeDeposito)
            {
                return BadRequest($"El depósito con ID {dto.id_deposito} no existe.");
            }

            var detalle = mapper.Map<DetalleColaboracion>(dto);
            context.DetalleColaboraciones.Add(detalle);
            await context.SaveChangesAsync();
            return Ok(detalle);
        }
    }
}
