# ApiJBA

ApiJBA es una API Web robusta y moderna desarrollada en **ASP.NET Core (C#)** diseñada para la gestión integral de datos de personal y el control de accesos al sistema basado en rangos jerárquicos.

## Características Principales

- **Gestión de Personal**: Operaciones CRUD completas para administrar el registro de personal (cédula, nombre, nivel de rango, cargo, estado, número de cuenta y archivo adjunto).
- **Asignación Automática de Cargos**: El sistema asigna automáticamente el cargo según el nivel jerárquico asignado si no se especifica uno personalizado:
  - `10` -> Sistemas
  - `9` -> Director
  - `8` -> Subdirector
  - `7` -> Secretaria
  - `6` -> Vocero
  - `1` a `5` -> Personal General
- **Seguridad y Autenticación JWT**:
  - Implementación de seguridad mediante JSON Web Tokens (JWT) Bearer con expiración de 5 minutos.
  - **Restricción de Acceso**: Solo los usuarios con un nivel de rango **mayor o igual a 7** tienen permitido el ingreso al sistema obteniendo un token.
  - **Control Basado en Roles**: Usuarios de Nivel 10 tienen acceso total, mientras que niveles operativos tienen permisos acordes.
- **Registro de Auditoría (Audit Logging)**:
  - Sistema integral de auditoría que guarda el historial de todas las operaciones (creación, modificación, desactivación).
  - Consulta del creador, modificadores y desactivador de un usuario, identificando al autor y la fecha exacta.

## Tecnologías Utilizadas

- **.NET Core / C#**
- **Entity Framework Core** (SQL Server)
- **AutoMapper** para la transferencia de datos limpia a través de DTOs.
- **Swagger / OpenAPI** para pruebas y documentación interactiva de endpoints.

## Configuración y Base de Datos

La API utiliza **SQL Server** como motor de base de datos principal. La cadena de conexión está configurada en `appsettings.Development.json` apuntando a la base de datos `BD_JBA`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=BD_JBA;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

### Inicialización de la Base de Datos
Para facilitar la portabilidad y el despliegue rápido, la base de datos se ha exportado como un script SQL estruturado. Para inicializarla desde cero:
1. Abra su cliente SQL Server preferido (por ejemplo, SQL Server Management Studio o Azure Data Studio) y conéctese a su servidor local.
2. Abra el archivo de inicialización ubicado en `Database/BD_JBA.sql`.
3. Descomente las primeras líneas de creación (`CREATE DATABASE [BD_JBA]; GO USE [BD_JBA]; GO`) o cree manualmente una base de datos vacía llamada `BD_JBA` y ejecute el script completo.
4. Una vez ejecutado, las tablas `personal` y `__EFMigrationsHistory` se habrán configurado correctamente y listas para el uso con la API.

---

## Optimización para Servidores de Recursos Limitados (i5 4ª Gen)

Para garantizar un rendimiento excelente bajo especificaciones de hardware de gama de entrada o servidores heredados (como procesadores Intel Core i5 de 4.ª generación con número limitado de hilos/núcleos físicos), se han implementado las siguientes optimizaciones de grado de producción en el código de la API:

1. **DbContext Pooling (`AddDbContextPool`)**: 
   - Habilitado en `Startup.cs`. En lugar de instanciar y destruir un contexto de base de datos para cada petición HTTP HTTP, ASP.NET Core reutiliza un pool pre-calentado de contextos. Esto reduce significativamente la presión sobre la recolección de basura (Garbage Collector) y ahorra valiosos ciclos de reloj de la CPU.
2. **Consultas Asíncronas Completas**: 
   - Todas las llamadas al motor de base de datos se ejecutan asíncronamente mediante `await` (`ToListAsync`, `FirstOrDefaultAsync`, `AnyAsync`). Esto previene el bloqueo de hilos del servidor web Kestrel, permitiéndole atender múltiples peticiones concurrentes de manera fluida sin agotar el pool de hilos.
3. **No-Tracking en Consultas de Solo Lectura (`AsNoTracking`)**: 
   - Implementado en todos los endpoints de lectura (`GET` de lista completa, de ID individual y login). Entity Framework Core no realiza seguimiento del estado de las entidades, eliminando overhead de memoria RAM y acelerando la velocidad de respuesta.
4. **Proyección Directa y Selectiva (Select Projections)**: 
   - En el endpoint de consulta rápida de IDs (`GET api/personal/ids`), se ha implementado una proyección selectiva de base de datos para recuperar únicamente el campo indexado `ci_p`. Esto evita cargar columnas de datos pesadas (como el campo binario `Archivo`) a la memoria RAM del servidor, minimizando el tráfico de red de base de datos.

---

## Endpoints Disponibles

### Personal

- `GET /api/personal` - Obtener la lista completa de personal (Optimizada con `AsNoTracking`).
- `GET /api/personal/ids` - Obtener la lista únicamente con los IDs (cédulas) del personal (Proyección selectiva ultraligera de BD).
- `GET /api/personal/{ci}` - Obtener el perfil detallado del personal por su cédula (`ci_p`).
- `POST /api/personal` - Registrar un nuevo personal en el sistema (admite niveles del 1 al 10).
- `PUT /api/personal/{ci}` - Actualizar los datos del personal.

### Autenticación y Acceso

- `POST /api/personal/login` - Iniciar sesión enviando la cédula:
  ```json
  {
    "ci_p": "1234567"
  }
  ```
  *Nota: Retorna un token JWT válido por 5 minutos si el nivel es mayor o igual a 7.*
- `GET /api/personal/refresh-token` - Renovar el token activo.

### Auditoría

- `GET /api/personal/{ci}/creador` - Obtiene quién creó el registro.
- `GET /api/personal/{ci}/modificadores` - Obtiene el historial de quiénes han modificado el registro.
- `GET /api/personal/{ci}/desactivador` - Obtiene quién desactivó el registro.

### Tablas Adicionales de la Base de Datos

Para dar soporte integral al resto de las operaciones del sistema, se han creado controladores individuales para las otras 16 tablas. Todos estos endpoints admiten solicitudes `GET` (para consultas masivas optimizadas con `AsNoTracking`) y `POST` (para inserciones con validaciones automáticas de claves foráneas). Requieren autenticación JWT con la política `NivelOperativo`:

- `GET /api/alumnos` & `POST /api/alumnos` - Gestión de alumnos.
- `GET /api/asistencias` & `POST /api/asistencias` - Control de entrada/salida de personal.
- `GET /api/categorias` & `POST /api/categorias` - Categorías de productos.
- `GET /api/colaboraciones` & `POST /api/colaboraciones` - Órdenes de colaboración de proveedores.
- `GET /api/depositos` & `POST /api/depositos` - Depósitos y almacenes.
- `GET /api/detallecolaboraciones` & `POST /api/detallecolaboraciones` - Detalle de las órdenes de colaboración.
- `GET /api/detallerecepciones` & `POST /api/detallerecepciones` - Detalle de recepción de productos.
- `GET /api/inscripciones` & `POST /api/inscripciones` - Inscripciones de alumnos en aulas.
- `GET /api/matriculas` & `POST /api/matriculas` - Aulas, secciones y capacidades de matrícula.
- `GET /api/operaciones` & `POST /api/operaciones` - Historial general de operaciones de auditoría.
- `GET /api/productos` & `POST /api/productos` - Catálogo de productos.
- `GET /api/proveedores` & `POST /api/proveedores` - Proveedores de servicios/productos.
- `GET /api/recepciones` & `POST /api/recepciones` - Recepción de colaboraciones.
- `GET /api/representantes` & `POST /api/representantes` - Representantes o padres de alumnos.
- `GET /api/stockdepositos` & `POST /api/stockdepositos` - Inventario y stock por depósito.
- `GET /api/traslados` & `POST /api/traslados` - Traslados de productos entre depósitos.

*Nota: Los DTOs de entrada están definidos en `DTOs/TableDtos.cs` y los mapeos se realizan automáticamente mediante perfiles de AutoMapper en `Utilidades/AutoMapperProfiles.cs`.*

