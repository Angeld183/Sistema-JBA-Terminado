using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using System;

namespace ApiJBA
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            // Registrar ApplicationDbContext con Pooling para maximizar el rendimiento en CPU de pocos recursos
            services.AddDbContextPool<ApplicationDbContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

            // Configurar los controladores ignorando los ciclos de referencia en JSON
            services.AddControllers().AddJsonOptions(x =>
                x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

            // Generador de Swagger
            services.AddSwaggerGen(c =>
            {
                c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Description = "Ingrese 'Bearer' [espacio] y luego su token.\r\n\r\nEjemplo: \"Bearer 12345abcdef\""
                });
                c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference
                            {
                                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                });
            });

            // Configuración de Autenticación JWT
            services.AddAuthentication(Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = Configuration["Jwt:Issuer"],
                        ValidAudience = Configuration["Jwt:Audience"],
                        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(Configuration["Jwt:Key"] ?? "")),
                        ClockSkew = TimeSpan.Zero // Fundamental para que expire exactamente a los 5 minutos sin tolerancia adicional
                    };
                });

            // Configuración de Políticas de Autorización por Niveles
            services.AddAuthorization(options =>
            {
                // Política para Secretarias, Subdirectores, Directores y Sistemas (Niveles 7 al 10)
                options.AddPolicy("NivelOperativo", policy =>
                    policy.RequireAssertion(context =>
                    {
                        var nivelClaim = context.User.FindFirst("Nivel");
                        if (nivelClaim != null && int.TryParse(nivelClaim.Value, out int nivel))
                        {
                            return nivel >= 7 && nivel <= 10;
                        }
                        return false;
                    }));

                // Política para Directores y Sistemas (Niveles 9 y 10) - Ejemplo para Desactivar
                options.AddPolicy("NivelAdministrador", policy =>
                    policy.RequireAssertion(context =>
                    {
                        var nivelClaim = context.User.FindFirst("Nivel");
                        if (nivelClaim != null && int.TryParse(nivelClaim.Value, out int nivel))
                        {
                            return nivel >= 9;
                        }
                        return false;
                    }));
            });

            // Configuración de AutoMapper buscando los perfiles del proyecto
            services.AddAutoMapper(typeof(Startup));

            // Configurar CORS para permitir solicitudes desde cualquier origen
            services.AddCors(options =>
            {
                options.AddDefaultPolicy(policyBuilder =>
                {
                    policyBuilder.AllowAnyOrigin()
                                 .AllowAnyMethod()
                                 .AllowAnyHeader();
                });
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // Configurar el pipeline de solicitudes HTTP
            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // app.UseHttpsRedirection(); // Deshabilitado: no hay puerto HTTPS configurado y causa que las respuestas se bloqueen

            app.UseCors(); // CORS debe ir antes de UseRouting para que las respuestas de error (404/400) también incluyan los headers CORS

            app.UseRouting();

            app.UseAuthentication(); // Debe ir antes de UseAuthorization
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
