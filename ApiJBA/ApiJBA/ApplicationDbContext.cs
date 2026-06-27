using Microsoft.EntityFrameworkCore;
using ApiJBA.Entidades;

namespace ApiJBA
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Personal> Personal { get; set; }
        public DbSet<Operacion> Operaciones { get; set; }
        public DbSet<Proveedor> Proveedores { get; set; }
        public DbSet<Representante> Representantes { get; set; }
        public DbSet<Alumno> Alumnos { get; set; }
        public DbSet<Colaboracion> Colaboraciones { get; set; }
        public DbSet<DetalleColaboracion> DetalleColaboraciones { get; set; }
        public DbSet<Recepcion> Recepciones { get; set; }
        public DbSet<DetalleRecepcion> DetalleRecepciones { get; set; }
        public DbSet<Matricula> Matriculas { get; set; }
        public DbSet<Inscripcion> Inscripciones { get; set; }
        public DbSet<Deposito> Depositos { get; set; }
        public DbSet<StockDeposito> StockDepositos { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Asistencia> Asistencias { get; set; }
        public DbSet<Traslado> Traslados { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración en cascada de la relación entre Personal y Operaciones (Auditoría)
            modelBuilder.Entity<Operacion>()
                .HasOne(o => o.Personal)
                .WithMany(p => p.Operaciones)
                .HasForeignKey(o => o.ci_p)
                .OnDelete(DeleteBehavior.Cascade);

            // Colaboracion relations
            modelBuilder.Entity<Colaboracion>()
                .HasOne(c => c.Proveedor)
                .WithMany(p => p.Colaboraciones)
                .HasForeignKey(c => c.id_proveedor)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Colaboracion>()
                .HasOne(c => c.Representante)
                .WithMany(r => r.Colaboraciones)
                .HasForeignKey(c => c.ci_representante)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Colaboracion>()
                .HasOne(c => c.Personal)
                .WithMany(p => p.Colaboraciones)
                .HasForeignKey(c => c.ci_p)
                .OnDelete(DeleteBehavior.Restrict);

            // DetalleColaboracion relations
            modelBuilder.Entity<DetalleColaboracion>()
                .HasOne(d => d.Colaboracion)
                .WithMany(c => c.Detalles)
                .HasForeignKey(d => d.id_orden)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DetalleColaboracion>()
                .HasOne(d => d.Producto)
                .WithMany(p => p.DetalleColaboraciones)
                .HasForeignKey(d => d.id_producto)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DetalleColaboracion>()
                .HasOne(d => d.Deposito)
                .WithMany(dep => dep.DetalleColaboraciones)
                .HasForeignKey(d => d.id_deposito)
                .OnDelete(DeleteBehavior.Restrict);

            // Recepcion relations
            modelBuilder.Entity<Recepcion>()
                .HasOne(r => r.Colaboracion)
                .WithOne(c => c.Recepcion)
                .HasForeignKey<Recepcion>(r => r.id_orden)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Recepcion>()
                .HasOne(r => r.Personal)
                .WithMany(p => p.Recepciones)
                .HasForeignKey(r => r.ci_p)
                .OnDelete(DeleteBehavior.Restrict);

            // DetalleRecepcion relations
            modelBuilder.Entity<DetalleRecepcion>()
                .HasOne(d => d.Recepcion)
                .WithMany(r => r.Detalles)
                .HasForeignKey(d => d.id_recepcion)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DetalleRecepcion>()
                .HasOne(d => d.Producto)
                .WithMany(p => p.DetalleRecepciones)
                .HasForeignKey(d => d.id_producto)
                .OnDelete(DeleteBehavior.Restrict);

            // Matricula relations
            modelBuilder.Entity<Matricula>()
                .HasOne(m => m.Personal)
                .WithMany(p => p.Matriculas)
                .HasForeignKey(m => m.ci_p)
                .OnDelete(DeleteBehavior.Restrict);

            // Inscripcion relations
            modelBuilder.Entity<Inscripcion>()
                .HasOne(i => i.Matricula)
                .WithMany(m => m.Inscripciones)
                .HasForeignKey(i => i.id_aula)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Inscripcion>()
                .HasOne(i => i.Alumno)
                .WithMany(a => a.Inscripciones)
                .HasForeignKey(i => i.ci_alumno)
                .OnDelete(DeleteBehavior.Cascade);

            // Alumno relations
            modelBuilder.Entity<Alumno>()
                .HasOne(a => a.Representante)
                .WithMany(r => r.Alumnos)
                .HasForeignKey(a => a.ci_representante)
                .OnDelete(DeleteBehavior.Restrict);

            // StockDeposito relations
            modelBuilder.Entity<StockDeposito>()
                .HasOne(s => s.Deposito)
                .WithMany(d => d.StockDepositos)
                .HasForeignKey(s => s.id_deposito)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StockDeposito>()
                .HasOne(s => s.Producto)
                .WithMany(p => p.StockDepositos)
                .HasForeignKey(s => s.id_producto)
                .OnDelete(DeleteBehavior.Cascade);

            // Producto relations
            modelBuilder.Entity<Producto>()
                .HasOne(p => p.Categoria)
                .WithMany(c => c.Productos)
                .HasForeignKey(p => p.id_categoria)
                .OnDelete(DeleteBehavior.Restrict);

            // Asistencia relations
            modelBuilder.Entity<Asistencia>()
                .HasOne(a => a.Personal)
                .WithMany(p => p.Asistencias)
                .HasForeignKey(a => a.ci_p)
                .OnDelete(DeleteBehavior.Cascade);

            // Traslado relations
            modelBuilder.Entity<Traslado>()
                .HasOne(t => t.DepositoOrigen)
                .WithMany()
                .HasForeignKey(t => t.id_dep_origen)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Traslado>()
                .HasOne(t => t.DepositoDestino)
                .WithMany()
                .HasForeignKey(t => t.id_dep_destino)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Traslado>()
                .HasOne(t => t.Producto)
                .WithMany(p => p.Traslados)
                .HasForeignKey(t => t.id_producto)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Traslado>()
                .HasOne(t => t.Personal)
                .WithMany(p => p.Traslados)
                .HasForeignKey(t => t.ci_p)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
