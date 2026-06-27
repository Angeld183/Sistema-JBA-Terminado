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
    [Route("api/detallerecepciones")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class DetalleRecepcionesController : ControllerBase
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;

        public DetalleRecepcionesController(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult<List<DetalleRecepcion>>> Get()
        {
            var detalles = await context.DetalleRecepciones.AsNoTracking().ToListAsync();
            return Ok(detalles);
        }

        [HttpPost]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Post(DetalleRecepcionCreacionDto dto)
        {
            // Validar dependencias
            var existeRecepcion = await context.Recepciones.AnyAsync(x => x.id_recepcion == dto.id_recepcion);
            if (!existeRecepcion)
            {
                return BadRequest($"La recepción con ID {dto.id_recepcion} no existe.");
            }

            var existeProducto = await context.Productos.AnyAsync(x => x.id_producto == dto.id_producto);
            if (!existeProducto)
            {
                return BadRequest($"El producto con ID {dto.id_producto} no existe.");
            }

            var detalle = mapper.Map<DetalleRecepcion>(dto);
            context.DetalleRecepciones.Add(detalle);
            await context.SaveChangesAsync();
            return Ok(detalle);
        }
    }
}
