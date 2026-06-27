# 📡 Documentación de la API (Backend)

La API del proyecto está desarrollada con **ASP.NET Core 10** y expone servicios RESTful con autenticación basada en tokens **JWT (JSON Web Tokens)**.

---

## 🔑 Autenticación y Autorización

### Flujo de Autenticación
1. El usuario envía sus credenciales al endpoint de login (`POST /api/personal/login`).
2. Si las credenciales son válidas y el nivel de rango es mayor o igual a **7**, el servidor responde con un token JWT firmado y su fecha de expiración.
3. El cliente (Frontend) almacena este token (por ejemplo, en `localStorage`) y lo incluye en la cabecera `Authorization` de todas las solicitudes posteriores:
   ```http
   Authorization: Bearer <TOKEN_JWT>
   ```

### Duración y Renovación del Token
- **Expiración:** El token tiene una duración de **5 minutos** exactos (`ClockSkew = TimeSpan.Zero`).
- **Renovación:** Existe un endpoint de refresco (`GET /api/personal/refresh-token`). Si hay actividad del usuario antes de que expire el token, el frontend solicita un nuevo token con otros 5 minutos de validez.

### Jerarquía y Políticas de Acceso
La API implementa políticas basadas en claims para asegurar que solo los usuarios autorizados accedan a ciertos recursos.

*   **NivelOperativo:** Requiere que el usuario autenticado tenga un claim `"Nivel"` con un valor entero entre **7 y 10** (ambos inclusive).
*   **NivelAdministrador:** Requiere un `"Nivel"` mayor o igual a **9** (Directores y Sistemas).
*   **Validación de Jerarquía Interna:** En los métodos de creación, actualización y desactivación de personal, se valida que el usuario que realiza la acción no pueda crear ni modificar a otro usuario con un nivel superior al suyo.

---

## 📂 Controladores y Endpoints

A continuación se detallan los endpoints agrupados por controlador:

### 1. Personal (`api/personal`)
Gestiona los usuarios y empleados con acceso al sistema y auditoría de cambios.

*   `GET /api/personal` - Obtiene la lista completa de empleados (solo DTO de lectura). *[Requiere NivelOperativo]*
*   `GET /api/personal/ids` - Proyección selectiva que devuelve solo los IDs (`ci_p`) de los empleados registrados. *[Requiere NivelOperativo]*
*   `GET /api/personal/{ci}` - Obtiene la información detallada de un empleado por su cédula. *[Requiere NivelOperativo]*
*   `GET /api/personal/{ci}/creador` - Consulta en la tabla de auditoría para saber qué empleado registró a este usuario. *[Requiere NivelOperativo]*
*   `GET /api/personal/{ci}/modificadores` - Historial de modificaciones del usuario. *[Requiere NivelOperativo]*
*   `GET /api/personal/{ci}/desactivador` - Consulta qué usuario desactivó la cuenta de este empleado. *[Requiere NivelOperativo]*
*   `POST /api/personal` - Registra un nuevo empleado. Asigna el cargo automáticamente si se omite. Valida jerarquías. *[Requiere NivelOperativo]*
*   `PUT /api/personal/{ci}` - Actualiza los datos de un empleado. Valida jerarquías. *[Requiere NivelOperativo]*
*   `PUT /api/personal/desactivar/{ci}` - Desactiva a un usuario (establece su estado en `false`). Valida jerarquías. *[Requiere NivelOperativo]*
*   `PUT /api/personal/activar/{ci}` - Reactiva la cuenta de un usuario. Valida jerarquías. *[Requiere NivelOperativo]*
*   `POST /api/personal/login` - Inicia sesión. Valida credenciales y requiere nivel $\ge 7$. *[Permite Anónimo]*
*   `GET /api/personal/refresh-token` - Renueva el token de autenticación del usuario actual. *[Requiere Autenticación]*

### 2. Alumnos (`api/alumnos`)
Controla la información y el ciclo escolar de los alumnos inscritos.

*   `GET /api/alumnos` - Listado completo de alumnos. *[Requiere NivelOperativo]*
*   `POST /api/alumnos` - Registra un nuevo alumno (valida si existe cédula del alumno y si está asociado a un representante válido). *[Requiere NivelOperativo]*
*   `PUT /api/alumnos/{ci}` - Modifica los datos del alumno. *[Requiere NivelOperativo]*
*   `DELETE /api/alumnos/{ci}` - Elimina físicamente el registro de un alumno. *[Requiere NivelOperativo]*
*   `POST /api/alumnos/promocionar` - **Proceso Escolar Automático:** Promueve de sala a los alumnos inscritos (ej. Sala 3 a Sala 4). Si el alumno pertenece a Sala 5, se gradúa/egresa (cambia estado a inactivo con motivo "Graduado/Egresado" y se le remueve de la inscripción activa). *[Requiere NivelOperativo]*

### 3. Representantes (`api/representantes`)
Administra los datos de los padres o tutores legales.

*   `GET /api/representantes` - Obtiene todos los representantes. *[Requiere NivelOperativo]*
*   `POST /api/representantes` - Crea un representante. *[Requiere NivelOperativo]*
*   `PUT /api/representantes/{ci}` - Modifica la información del representante. *[Requiere NivelOperativo]*

### 4. Matrículas / Salones (`api/matriculas`)
Configuración de las aulas físicas, secciones y capacidades.

*   `GET /api/matriculas` - Lista todas las matrículas/aulas. *[Requiere NivelOperativo]*
*   `POST /api/matriculas` - Crea un aula (sección, turno, docente a cargo (`ci_p`), capacidad de alumnos, cupo de varones/hembras). *[Requiere NivelOperativo]*
*   `PUT /api/matriculas/{id}` - Modifica la matrícula del salón. *[Requiere NivelOperativo]*

### 5. Inscripciones (`api/inscripciones`)
Relaciona a los alumnos con los salones (matrículas) correspondientes.

*   `GET /api/inscripciones` - Lista de inscripciones activas. *[Requiere NivelOperativo]*
*   `POST /api/inscripciones` - Registra la inscripción de un alumno en un aula (valida que existan tanto el alumno como el aula). *[Requiere NivelOperativo]*

### 6. Asistencias (`api/asistencias`)
Monitoreo de la jornada laboral de los empleados.

*   `GET /api/asistencias` - Historial de asistencia general. *[Requiere NivelOperativo]*
*   `POST /api/asistencias` - Registra la hora de entrada de un empleado. *[Requiere NivelOperativo]*
*   `PUT /api/asistencias/{id}` - Registra la hora de salida de un empleado (actualiza el campo `salida`). *[Requiere NivelOperativo]*

### 7. Inventario y Depósitos
Módulos para control de almacén y mercancía.

*   **Categorías (`api/categorias`):**
    *   `GET /api/categorias` - Obtiene las categorías de productos.
    *   `POST /api/categorias` - Crea una nueva categoría.
*   **Productos (`api/productos`):**
    *   `GET /api/productos` - Obtiene todos los productos registrados.
    *   `POST /api/productos` - Registra un producto.
    *   `GET /api/productos/buscar/{codigo}` - Busca un producto específico por su código corto.
*   **Depósitos (`api/depositos`):**
    *   `GET /api/depositos` - Devuelve la lista de almacenes. Sincroniza automáticamente las aulas de matrículas y crea el "Depósito General" si no existen.
    *   `POST /api/depositos` - Crea un nuevo depósito.
*   **Stock de Depósitos (`api/stockdepositos`):**
    *   `GET /api/stockdepositos` - Consulta el stock actual en los depósitos incluyendo la información detallada del producto.
    *   `POST /api/stockdepositos` - Agrega o incrementa stock de un producto en un depósito específico.
    *   `PUT /api/stockdepositos/{id}` - Actualiza cantidades mínimas y actuales de stock.
    *   `DELETE /api/stockdepositos/{id}` - Elimina stock del almacén.
*   **Traslados (`api/traslados`):**
    *   `GET /api/traslados` - Historial de traslados de mercancía.
    *   `POST /api/traslados` - Registra un traslado de mercancía entre depósitos. Valida si el depósito origen cuenta con el stock suficiente y realiza el descuento/incremento en las tablas de stock de forma transaccional.

### 8. Proveedores, Colaboraciones y Recepciones
Módulos para recibir donaciones o comprar mercancías a proveedores.

*   **Proveedores (`api/proveedores`):**
    *   `GET /api/proveedores` | `POST /api/proveedores`
*   **Colaboraciones (`api/colaboraciones`):**
    *   `GET /api/colaboraciones` | `POST /api/colaboraciones` (Cabecera de la orden)
*   **Detalles de Colaboración (`api/detallecolaboraciones`):**
    *   `GET /api/detallecolaboraciones` | `POST /api/detallecolaboraciones` (Productos solicitados)
*   **Recepciones (`api/recepciones`):**
    *   `GET /api/recepciones` | `POST /api/recepciones` (Registro de llegada de mercancía)
*   **Detalles de Recepción (`api/detallerecepciones`):**
    *   `GET /api/detallerecepciones` | `POST /api/detallerecepciones` (Registro individual de cantidad recibida y fecha de vencimiento)

---

## 📋 Códigos de Respuesta HTTP Comunes

*   `200 OK`: La solicitud se procesó con éxito y devuelve la información solicitada.
*   `201 Created`: El recurso se creó exitosamente (e.g. en el registro de personal o inscripciones).
*   `204 NoContent`: La actualización o borrado se realizó con éxito y no hay contenido para retornar.
*   `400 BadRequest`: Error de validación en los datos enviados o reglas de negocio no cumplidas (ej. stock insuficiente, cédula duplicada).
*   `401 Unauthorized`: No se proporcionó el token JWT o este ya expiró.
*   `403 Forbidden`: El usuario no cuenta con el nivel jerárquico adecuado para la acción o intentó modificar a un usuario de mayor rango.
*   `404 NotFound`: El recurso buscado no existe en la base de datos.
