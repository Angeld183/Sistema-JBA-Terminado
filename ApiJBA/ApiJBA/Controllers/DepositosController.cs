using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiJBA.DTOs;
using ApiJBA.Entidades;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Linq;

namespace ApiJBA.Controllers
{
    [ApiController]
    [Route("api/depositos")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class DepositosController : ControllerBase
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;

        public DepositosController(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult<List<Deposito>>> Get()
        {
            // 1. Asegurar que exista al menos una categoría general
            var categoriaGeneral = await context.Categorias.FirstOrDefaultAsync(c => c.nombre_categoria == "General");
            if (categoriaGeneral == null)
            {
                categoriaGeneral = new Categoria { nombre_categoria = "General" };
                context.Categorias.Add(categoriaGeneral);
                await context.SaveChangesAsync();
            }

            // 2. Asegurar que exista el Depósito General
            var depGeneral = await context.Depositos.FirstOrDefaultAsync(d => d.id_aula == null && d.nombre_d == "Depósito General");
            if (depGeneral == null)
            {
                depGeneral = new Deposito
                {
                    nombre_d = "Depósito General",
                    fecha_registro = System.DateTime.Now
                };
                context.Depositos.Add(depGeneral);
                await context.SaveChangesAsync();
            }

            // 3. Asegurar que todas las aulas en matriculas estén sincronizadas en la tabla depositos
            var aulas = await context.Matriculas.ToListAsync();
            var depositosAulas = await context.Depositos.Where(d => d.id_aula != null).ToListAsync();
            var syncRequired = false;

            foreach (var aula in aulas)
            {
                var dep = depositosAulas.FirstOrDefault(d => d.id_aula == aula.id_aula);
                if (dep == null)
                {
                    dep = new Deposito
                    {
                        id_aula = aula.id_aula,
                        nombre_d = $"{aula.aula} - Sección {aula.seccion}",
                        fecha_registro = System.DateTime.Now
                    };
                    context.Depositos.Add(dep);
                    syncRequired = true;
                }
                else if (dep.nombre_d != $"{aula.aula} - Sección {aula.seccion}")
                {
                    dep.nombre_d = $"{aula.aula} - Sección {aula.seccion}";
                    context.Depositos.Update(dep);
                    syncRequired = true;
                }
            }

            if (syncRequired)
            {
                await context.SaveChangesAsync();
            }

            var depositos = await context.Depositos.AsNoTracking().ToListAsync();
            return Ok(depositos);
        }

        [HttpPost]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Post(DepositoCreacionDto dto)
        {
            var deposito = mapper.Map<Deposito>(dto);
            context.Depositos.Add(deposito);
            await context.SaveChangesAsync();
            return Ok(deposito);
        }
    }
}
