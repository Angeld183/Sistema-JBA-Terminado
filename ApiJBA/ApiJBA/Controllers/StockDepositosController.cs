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
    [Route("api/stockdepositos")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class StockDepositosController : ControllerBase
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;

        public StockDepositosController(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult<List<StockDeposito>>> Get()
        {
            var stock = await context.StockDepositos
                .Include(x => x.Producto)
                .AsNoTracking()
                .ToListAsync();
            return Ok(stock);
        }

        [HttpPost]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Post(StockDepositoCreacionDto dto)
        {
            // Validar dependencias
            var existeDeposito = await context.Depositos.AnyAsync(x => x.id_deposito == dto.id_deposito);
            if (!existeDeposito)
            {
                return BadRequest($"El depósito con ID {dto.id_deposito} no existe.");
            }

            var existeProducto = await context.Productos.AnyAsync(x => x.id_producto == dto.id_producto);
            if (!existeProducto)
            {
                return BadRequest($"El producto con ID {dto.id_producto} no existe.");
            }

            // Comprobar si ya existe el stock para ese producto en ese depósito
            var stockExistente = await context.StockDepositos
                .FirstOrDefaultAsync(x => x.id_deposito == dto.id_deposito && x.id_producto == dto.id_producto);

            if (stockExistente != null)
            {
                stockExistente.cantidad += dto.cantidad;
                await context.SaveChangesAsync();
                return Ok(stockExistente);
            }

            var stock = mapper.Map<StockDeposito>(dto);
            context.StockDepositos.Add(stock);
            await context.SaveChangesAsync();
            return Ok(stock);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Put(int id, StockDepositoCreacionDto dto)
        {
            var stock = await context.StockDepositos.FindAsync(id);
            if (stock == null)
            {
                return NotFound($"No existe stock con el ID {id}.");
            }

            stock.cantidad = dto.cantidad;
            stock.cantidad_min = dto.cantidad_min;

            await context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Delete(int id)
        {
            var stock = await context.StockDepositos.FindAsync(id);
            if (stock == null)
            {
                return NotFound($"No existe stock con el ID {id}.");
            }

            context.StockDepositos.Remove(stock);
            await context.SaveChangesAsync();
            return NoContent();
        }
    }
}
