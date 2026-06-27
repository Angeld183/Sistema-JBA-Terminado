using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiJBA.DTOs;
using ApiJBA.Entidades;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System;

namespace ApiJBA.Controllers
{
    [ApiController]
    [Route("api/personal")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class PersonalController : ControllerBase
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;
        private readonly IConfiguration configuration;

        public PersonalController(ApplicationDbContext context, IMapper mapper, IConfiguration configuration)
        {
            this.context = context;
            this.mapper = mapper;
            this.configuration = configuration;
        }

        // 1. GET: api/personal - Obtener todo el personal
        [HttpGet]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult<List<CreacionDePersonal_Get_DTO>>> Get()
        {
            var personalList = await context.Personal.AsNoTracking().ToListAsync();
            var dto = mapper.Map<List<CreacionDePersonal_Get_DTO>>(personalList);
            return Ok(dto);
        }

        // 1b. GET: api/personal/ids - Obtener solo los IDs del personal creado
        [HttpGet("ids")]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult<List<PersonalIdDto>>> GetIds()
        {
            // Optimización premium: Proyección selectiva directa desde BD evitando cargar columnas pesadas en memoria
            var ids = await context.Personal
                .AsNoTracking()
                .Select(x => new PersonalIdDto { id_p = x.ci_p })
                .ToListAsync();
            return Ok(ids);
        }

        // 2. GET: api/personal/{ci} - Obtener personal por Cédula (PK)
        [HttpGet("{ci}")]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult<CreacionDePersonal_Get_DTO>> GetByCi(string ci)
        {
            var personal = await context.Personal.AsNoTracking().FirstOrDefaultAsync(x => x.ci_p == ci);
            if (personal == null)
            {
                return NotFound($"No se encontró personal con la cédula: {ci}");
            }
            var dto = mapper.Map<CreacionDePersonal_Get_DTO>(personal);
            return Ok(dto);
        }

        // 2b. GET: api/personal/{ci}/creador - Obtener quién creó a este usuario
        [HttpGet("{ci}/creador")]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> GetCreador(string ci)
        {
            // Busca en la tabla de operaciones quién registró la acción "CREAR_PERSONAL" para este registro_id
            var operacion = await context.Operaciones
                .AsNoTracking()
                .Where(x => x.registro_id == ci && x.tipo_operacion == "CREAR_PERSONAL")
                .FirstOrDefaultAsync();

            if (operacion == null)
            {
                return NotFound(new { mensaje = $"No se encontró un registro de creación para el personal con cédula {ci}." });
            }

            // Devuelve el ci_p (como id_p según lo solicitado) del autor y la fecha
            return Ok(new 
            { 
                id_p = operacion.ci_p,
                fecha_creacion = operacion.fecha
            });
        }

        // 2c. GET: api/personal/{ci}/modificadores - Obtener quién modificó a este usuario (Historial)
        [HttpGet("{ci}/modificadores")]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> GetModificadores(string ci)
        {
            // Un usuario puede ser modificado muchas veces, así que buscamos todas las modificaciones
            // y las ordenamos de la más reciente a la más antigua
            var operaciones = await context.Operaciones
                .AsNoTracking()
                .Where(x => x.registro_id == ci && x.tipo_operacion == "MODIFICAR_PERSONAL")
                .OrderByDescending(x => x.fecha)
                .Select(x => new 
                {
                    id_p = x.ci_p,
                    fecha_modificacion = x.fecha
                })
                .ToListAsync();

            if (!operaciones.Any())
            {
                return NotFound(new { mensaje = $"No se encontraron registros de modificación para el personal con cédula {ci}." });
            }

            // Devuelve la lista de modificaciones con su id_p (el autor) y la fecha
            return Ok(operaciones);
        }

        // 2d. GET: api/personal/{ci}/desactivador - Obtener quién desactivó a este usuario
        [HttpGet("{ci}/desactivador")]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> GetDesactivador(string ci)
        {
            // Buscamos la acción de desactivación más reciente
            var operacion = await context.Operaciones
                .AsNoTracking()
                .Where(x => x.registro_id == ci && x.tipo_operacion == "DESACTIVAR_PERSONAL")
                .OrderByDescending(x => x.fecha)
                .FirstOrDefaultAsync();

            if (operacion == null)
            {
                return NotFound(new { mensaje = $"No se encontró un registro de desactivación para el personal con cédula {ci}." });
            }

            // Devuelve el ci_p (como id_p según lo solicitado) del autor y la fecha
            return Ok(new 
            { 
                id_p = operacion.ci_p,
                fecha_desactivacion = operacion.fecha
            });
        }

        // 3. POST: api/personal - Registrar un nuevo personal
        [HttpPost]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Post(CreacionDePersonal_Post_DTO creacionDePersonal_Post_DTO)
        {
            // Obtener nivel del creador
            var nivelClaim = User.FindFirst("Nivel")?.Value;
            if (!int.TryParse(nivelClaim, out int nivelActor))
            {
                return Unauthorized("No se pudo determinar tu nivel de acceso.");
            }

            // Validar Jerarquía: No puede crear a alguien con mayor nivel que él mismo
            if (nivelActor < creacionDePersonal_Post_DTO.nivel)
            {
                return StatusCode(403, new { mensaje = $"Acceso denegado. No puedes crear un usuario con nivel {creacionDePersonal_Post_DTO.nivel} porque tu nivel es {nivelActor}." });
            }

            // Validar si ya existe un registro con la misma Cédula (PK)
            var existe = await context.Personal.AnyAsync(x => x.ci_p == creacionDePersonal_Post_DTO.ci_p);
            if (existe)
            {
                return BadRequest($"Ya existe un personal registrado con la cédula: {creacionDePersonal_Post_DTO.ci_p}");
            }

            var mapeo = mapper.Map<Personal>(creacionDePersonal_Post_DTO);

            // Asignación automática de cargo según el nivel si no se especificó un cargo personalizado
            if (string.IsNullOrWhiteSpace(mapeo.cargo))
            {
                mapeo.cargo = ObtenerCargoPorNivel(mapeo.nivel);
            }

            context.Add(mapeo);
            
            // Obtener CI del usuario que está haciendo la acción (el autor)
            var ciAutor = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "SISTEMA";
            
            // Registrar la auditoría
            var operacion = new Operacion
            {
                ci_p = ciAutor,
                fecha = DateTime.Now,
                registro_id = mapeo.ci_p,
                tipo_operacion = "CREAR_PERSONAL"
            };
            context.Operaciones.Add(operacion);

            await context.SaveChangesAsync();

            var getDto = mapper.Map<CreacionDePersonal_Get_DTO>(mapeo);
            return CreatedAtAction(nameof(GetByCi), new { ci = mapeo.ci_p }, getDto);
        }

        // 4. PUT: api/personal/{ci} - Actualizar datos del personal
        [HttpPut("{ci}")]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Put(string ci, CreacionDePersonal_Get_DTO creacionDePersonal_Get_DTO)
        {
            if (ci != creacionDePersonal_Get_DTO.ci_p)
            {
                return BadRequest("La cédula proporcionada no coincide con el cuerpo de la solicitud.");
            }

            // Obtener nivel del usuario que hace la solicitud
            var nivelClaim = User.FindFirst("Nivel")?.Value;
            if (!int.TryParse(nivelClaim, out int nivelActor))
            {
                return Unauthorized("No se pudo determinar tu nivel de acceso.");
            }

            // Validar que no intente ascender a alguien por encima de su propio nivel
            if (nivelActor < creacionDePersonal_Get_DTO.nivel)
            {
                return StatusCode(403, new { mensaje = $"Acceso denegado. No puedes asignarle a este usuario un nivel ({creacionDePersonal_Get_DTO.nivel}) superior al tuyo ({nivelActor})." });
            }

            var personalExistente = await context.Personal.AsNoTracking().FirstOrDefaultAsync(x => x.ci_p == ci);
            if (personalExistente == null)
            {
                return NotFound($"La cédula: {ci} no existe.");
            }

            // Validar Jerarquía: No puede modificar a un usuario que actualmente tiene mayor nivel que él
            if (nivelActor < personalExistente.nivel)
            {
                return StatusCode(403, new { mensaje = $"Acceso denegado. Un usuario de nivel {nivelActor} no puede modificar a un usuario de nivel superior ({personalExistente.nivel})." });
            }

            var mapeo = mapper.Map<Personal>(creacionDePersonal_Get_DTO);

            // Conservar contraseña existente si no se provee una nueva en el DTO
            if (string.IsNullOrWhiteSpace(mapeo.contrasena))
            {
                mapeo.contrasena = personalExistente.contrasena;
            }

            // Asignación automática de cargo según el nivel por seguridad si viene vacío
            if (string.IsNullOrWhiteSpace(mapeo.cargo))
            {
                mapeo.cargo = ObtenerCargoPorNivel(mapeo.nivel);
            }

            context.Update(mapeo);
            
            // Obtener CI del usuario que está haciendo la acción (el autor)
            var ciAutor = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "SISTEMA";

            // Registrar la auditoría
            var operacion = new Operacion
            {
                ci_p = ciAutor,
                fecha = DateTime.Now,
                registro_id = mapeo.ci_p,
                tipo_operacion = "MODIFICAR_PERSONAL"
            };
            context.Operaciones.Add(operacion);

            await context.SaveChangesAsync();
            return Ok(creacionDePersonal_Get_DTO);
        }

        // 4b. PUT: api/personal/desactivar/{ci} - Desactivar personal (cambiar estado a 0)
        [HttpPut("desactivar/{ci}")]
        [Authorize(Policy = "NivelOperativo")] // Acceso desde nivel 7, pero con validación interna de jerarquía
        public async Task<ActionResult> Desactivar(string ci)
        {
            var personal = await context.Personal.FirstOrDefaultAsync(x => x.ci_p == ci);
            if (personal == null)
            {
                return NotFound($"La cédula: {ci} no existe.");
            }

            // Obtener el nivel del usuario que está haciendo la petición
            var nivelClaim = User.FindFirst("Nivel")?.Value;
            if (string.IsNullOrEmpty(nivelClaim) || !int.TryParse(nivelClaim, out int nivelActor))
            {
                return Unauthorized("No se pudo determinar tu nivel de acceso.");
            }

            // Validación de Jerarquía: Un usuario solo puede desactivar a alguien de su mismo nivel o inferior
            if (nivelActor < personal.nivel)
            {
                return StatusCode(403, new { mensaje = $"Acceso denegado. Un usuario de nivel {nivelActor} no puede desactivar a un usuario de nivel superior ({personal.nivel})." });
            }

            // Cambiar el estado a false (inactivo/desactivado)
            personal.estado = false;
            
            // Opcional: También podríamos registrar la fecha de salida (fs_p) si aplica
            // personal.fs_p = DateTime.Now;

            context.Update(personal);

            // Obtener CI del usuario que está haciendo la acción (el autor)
            var ciAutor = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "SISTEMA";

            // Registrar la auditoría
            var operacion = new Operacion
            {
                ci_p = ciAutor,
                fecha = DateTime.Now,
                registro_id = personal.ci_p,
                tipo_operacion = "DESACTIVAR_PERSONAL"
            };
            context.Operaciones.Add(operacion);

            await context.SaveChangesAsync();

            return Ok(new { mensaje = $"El personal con cédula {ci} ha sido desactivado exitosamente." });
        }

        // 4c. PUT: api/personal/activar/{ci} - Activar personal (cambiar estado a true)
        [HttpPut("activar/{ci}")]
        [Authorize(Policy = "NivelOperativo")]
        public async Task<ActionResult> Activar(string ci)
        {
            var personal = await context.Personal.FirstOrDefaultAsync(x => x.ci_p == ci);
            if (personal == null)
            {
                return NotFound($"La cédula: {ci} no existe.");
            }

            var nivelClaim = User.FindFirst("Nivel")?.Value;
            if (string.IsNullOrEmpty(nivelClaim) || !int.TryParse(nivelClaim, out int nivelActor))
            {
                return Unauthorized("No se pudo determinar tu nivel de acceso.");
            }

            if (nivelActor < personal.nivel)
            {
                return StatusCode(403, new { mensaje = $"Acceso denegado. Un usuario de nivel {nivelActor} no puede activar a un usuario de nivel superior ({personal.nivel})." });
            }

            personal.estado = true;
            context.Update(personal);

            var ciAutor = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "SISTEMA";

            var operacion = new Operacion
            {
                ci_p = ciAutor,
                fecha = DateTime.Now,
                registro_id = personal.ci_p,
                tipo_operacion = "ACTIVAR_PERSONAL"
            };
            context.Operaciones.Add(operacion);

            await context.SaveChangesAsync();

            return Ok(new { mensaje = $"El personal con cédula {ci} ha sido activado exitosamente." });
        }

        // 5. POST: api/personal/login - Iniciar sesión validando cédula, contraseña y nivel de rango (nivel >= 7)
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult> Login(LoginDto loginDto)
        {
            var personal = await context.Personal.AsNoTracking().FirstOrDefaultAsync(x => x.ci_p == loginDto.ci_p);
            if (personal == null)
            {
                return NotFound(new { mensaje = "Usuario o contraseña incorrectos." });
            }

            // Validar contraseña
            if (personal.contrasena != loginDto.contrasena)
            {
                return BadRequest(new { mensaje = "Usuario o contraseña incorrectos." });
            }

            // Validar nivel de rango: si es inferior a 7, denegar el acceso al sistema
            if (personal.nivel < 7)
            {
                return BadRequest(new { mensaje = $"Acceso denegado. Tu nivel de rango ({personal.nivel}) es inferior al mínimo requerido (nivel 7) para utilizar el sistema." });
            }

            var dto = mapper.Map<CreacionDePersonal_Get_DTO>(personal);
            
            // Generar el Token JWT
            var token = GenerarTokenJWT(personal);

            return Ok(new
            {
                mensaje = "Inicio de sesión exitoso. Bienvenido al sistema.",
                usuario = dto,
                token = token,
                expiracion = DateTime.UtcNow.AddMinutes(5)
            });
        }

        // 6. GET: api/personal/refresh-token - Renovar el token si hay actividad
        [HttpGet("refresh-token")]
        [Authorize]
        public async Task<ActionResult> RefreshToken()
        {
            // Obtener la cédula del usuario desde los claims del token actual
            var ci = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(ci))
            {
                return Unauthorized("Token inválido.");
            }

            // Buscar el usuario actualizado en la BD
            var personal = await context.Personal.AsNoTracking().FirstOrDefaultAsync(x => x.ci_p == ci);
            if (personal == null || personal.nivel < 7)
            {
                return Unauthorized("Usuario no existe o no tiene permisos.");
            }

            // Generar un nuevo token con otros 5 minutos de vida
            var nuevoToken = GenerarTokenJWT(personal);

            return Ok(new
            {
                mensaje = "Sesión renovada por 5 minutos más.",
                token = nuevoToken,
                expiracion = DateTime.UtcNow.AddMinutes(5)
            });
        }

        private string GenerarTokenJWT(Personal personal)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, personal.ci_p),
                new Claim(ClaimTypes.Name, personal.nombre_p),
                new Claim(ClaimTypes.Role, personal.cargo ?? ""),
                new Claim("Nivel", personal.nivel.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"] ?? ""));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiracion = DateTime.UtcNow.AddMinutes(5);

            var token = new JwtSecurityToken(
                issuer: configuration["Jwt:Issuer"],
                audience: configuration["Jwt:Audience"],
                claims: claims,
                expires: expiracion,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // Método auxiliar para la asignación automática del cargo por nivel
        private string ObtenerCargoPorNivel(int nivel)
        {
            return nivel switch
            {
                10 => "Sistemas",
                9 => "Director",
                8 => "Subdirector",
                7 => "Secretaria",
                6 => "Vocero",
                _ => "Personal General"
            };
        }
    }
}
