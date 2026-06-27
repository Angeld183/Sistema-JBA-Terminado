using AutoMapper;
using ApiJBA.DTOs;
using ApiJBA.Entidades;

namespace ApiJBA.Utilidades
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            // Mapeos para la entidad Personal
            CreateMap<CreacionDePersonal_Post_DTO, Personal>();
            CreateMap<Personal, CreacionDePersonal_Get_DTO>();
            CreateMap<CreacionDePersonal_Get_DTO, Personal>();
            
            // Mapeo especial para traer únicamente el ID
            CreateMap<Personal, PersonalIdDto>()
                .ForMember(dest => dest.id_p, opt => opt.MapFrom(src => src.ci_p));

            // Mapeos para las demás entidades
            CreateMap<AlumnoCreacionDto, Alumno>();
            CreateMap<AsistenciaCreacionDto, Asistencia>();
            CreateMap<CategoriaCreacionDto, Categoria>();
            CreateMap<ColaboracionCreacionDto, Colaboracion>();
            CreateMap<DepositoCreacionDto, Deposito>();
            CreateMap<DetalleColaboracionCreacionDto, DetalleColaboracion>();
            CreateMap<DetalleRecepcionCreacionDto, DetalleRecepcion>();
            CreateMap<InscripcionCreacionDto, Inscripcion>();
            CreateMap<MatriculaCreacionDto, Matricula>();
            CreateMap<OperacionCreacionDto, Operacion>();
            CreateMap<ProductoCreacionDto, Producto>();
            CreateMap<ProveedorCreacionDto, Proveedor>();
            CreateMap<RecepcionCreacionDto, Recepcion>();
            CreateMap<RepresentanteCreacionDto, Representante>();
            CreateMap<StockDepositoCreacionDto, StockDeposito>();
            CreateMap<TrasladoCreacionDto, Traslado>();
        }
    }
}
