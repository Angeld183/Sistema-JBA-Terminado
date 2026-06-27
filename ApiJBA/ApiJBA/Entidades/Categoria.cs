using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ApiJBA.Entidades
{
    [Table("categoria")]
    public class Categoria
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_categoria { get; set; }

        [Required]
        [Column(TypeName = "varchar(100)")]
        [StringLength(100)]
        public string nombre_categoria { get; set; } = default!;

        // Propiedades de navegación
        public ICollection<Producto> Productos { get; set; } = new List<Producto>();
    }
}
