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
    [Route("api/productos")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ProductosController : ControllerBase
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;

        public ProductosController(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult<List<Producto>>> Get()
        {
            var productos = await context.Productos.AsNoTracking().ToListAsync();
            return Ok(productos);
        }

        [HttpPost]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Post(ProductoCreacionDto dto)
        {
            // Validar categoria
            var existeCategoria = await context.Categorias.AnyAsync(x => x.id_categoria == dto.id_categoria);
            if (!existeCategoria)
            {
                return BadRequest($"La categoría con ID {dto.id_categoria} no existe.");
            }

            var producto = mapper.Map<Producto>(dto);
            context.Productos.Add(producto);
            await context.SaveChangesAsync();
            return Ok(producto);
        }

        [HttpGet("buscar/{codigo}")]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult<Producto>> GetByCodigo(string codigo)
        {
            var producto = await context.Productos.AsNoTracking()
                .FirstOrDefaultAsync(x => x.codigo_corto == codigo);
            if (producto == null)
            {
                return NotFound($"No existe producto con código {codigo}.");
            }
            return Ok(producto);
        }
    }
}
