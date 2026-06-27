# 🖼️ Documentación del Frontend (Angular)

El frontend de la aplicación está desarrollado con **Angular 21** bajo el enfoque moderno de **Componentes Standalone**, eliminando el uso tradicional de `NgModule` para simplificar la estructura del proyecto y optimizar la carga a través de la modularización directa.

---

## 🧭 Configuración y Enrutamiento

### Configuración Global (`src/app/app.config.ts`)
Define los proveedores globales de Angular necesarios para el arranque de la aplicación:
- `provideZoneChangeDetection({ eventCoalescing: true })` para optimizar los ciclos de detección de cambios.
- `provideRouter(routes)` para inyectar el árbol de enrutamiento principal.

### Definición de Rutas (`src/app/app.routes.ts`)
El sistema utiliza rutas anidadas (hijas) para mantener la barra lateral de navegación (Menú) siempre visible mientras se intercambia el contenido principal:

```typescript
export const routes: Routes = [
  { path: '', component: LoginComponent },
  { 
    path: 'menu', 
    component: MenuComponent, 
    children: [
      { path: 'empleados', component: EmpleadosComponent },
      { path: 'nueva-inscripcion', component: InscripcionComponent },
      { path: 'alumnos-inscritos', component: AlumnosInscritosComponent },
      { path: 'salones', component: SalonesComponent },
      { path: 'gestion-caja', component: GestionCajaComponent },
      { path: 'asistencia', component: AsistenciaComponent },
      { path: 'inventario', component: InventarioComponent }
    ]
  }
];
```

---

## 🧱 Estructura de Componentes

### 1. `LoginComponent`
*   **Archivos:** `src/app/app.ts` (clase), `src/app/Login.html` (plantilla), `src/app/app.css` (estilos).
*   **Función:** Proporciona el formulario de acceso al sistema escolar.
*   **Flujo:**
    - Solicita Cédula de Identidad y Contraseña.
    - Envía las credenciales al endpoint de login (`POST /api/personal/login`).
    - Al autenticar con éxito, almacena el `token`, el `usuario` y la `expiracion` en el `localStorage`.
    - Redirecciona al usuario a la ruta `/menu`.

### 2. `MenuComponent` (Layout Principal)
*   **Archivos:** `src/app/app.ts`, `src/app/Menu.html`, `src/app/Menu.css`.
*   **Función:** Contiene la barra lateral de navegación (`aside`) y el área de contenido principal (`<router-outlet>`).
*   **Flujo:**
    - Carga los datos del usuario logueado desde `localStorage` para mostrar su nombre y cargo.
    - Controla la visualización del menú lateral en dispositivos móviles.
    - Proporciona el botón de "Cerrar Sesión", que limpia el almacenamiento local y redirige al Login.

### 3. `EmpleadosComponent`
*   **Archivos:** `src/app/app.ts`, `src/app/Empleados.html`, `src/app/Empleados.css`.
*   **Función:** Módulo de administración de personal para directivos y personal de sistemas.
*   **Características:**
    - Carga la lista completa de empleados.
    - Permite registrar nuevos empleados con validación en el frontend.
    - Habilita la actualización de datos (Dirección, Teléfono, Correo, Nivel y Cargo).
    - Permite Activar/Desactivar cuentas de empleados.
    - Muestra detalles de auditoría de cada registro (quién lo creó, quién lo modificó y quién lo desactivó).

### 4. `InscripcionComponent`
*   **Archivos:** `src/app/inscripcion.ts`, `src/app/inscripcion.html`, `src/app/inscripcion.css`.
*   **Función:** Registra al representante legal, al alumno y formaliza la inscripción escolar en un solo flujo continuo.
*   **Flujo:**
    - Paso 1: Datos del representante (Cédula, nombre del padre/madre, estatus laboral, dirección).
    - Paso 2: Datos del alumno (Cédula, nombre, edad, sexo, condiciones médicas como problemas cardiovasculares).
    - Paso 3: Selección de aula/matrícula disponible.

### 5. `AlumnosInscritosComponent`
*   **Archivos:** `src/app/alumnos-inscritos.ts`, `src/app/alumnos-inscritos.html`.
*   **Función:** Listado y control general de los alumnos del preescolar.
*   **Características:**
    - Muestra la lista de estudiantes inscritos.
    - Habilita la edición de datos del estudiante.
    - Permite eliminar registros de alumnos.
    - **Botón de Promoción de Año Escolar:** Permite disparar de forma centralizada el proceso de fin de curso, graduando a los alumnos de Sala de 5 y ascendiendo de nivel al resto.

### 6. `SalonesComponent`
*   **Archivos:** `src/app/salones.ts`, `src/app/salones.html`, `src/app/salones.css`.
*   **Función:** Configura la capacidad y las características de las aulas de clase.
*   **Características:**
    - Crea nuevas secciones/aulas (Sala de 3, Sala de 4, Sala de 5).
    - Asigna el turno (Mañana/Tarde), docente titular (cédula del personal) y cupos disponibles.
    - Controla el balance de varones y hembras.

### 7. `AsistenciaComponent`
*   **Archivos:** `src/app/asistencia.ts`, `src/app/asistencia.html`, `src/app/asistencia.css`.
*   **Función:** Panel para registrar diariamente la entrada y salida de los trabajadores.
*   **Características:**
    - Entrada rápida introduciendo la cédula del empleado.
    - Valida que el empleado exista y no tenga ya una entrada abierta para el día.
    - Botón para registrar salida que actualiza el registro abierto del día.

### 8. `InventarioComponent`
*   **Archivos:** `src/app/inventario.ts`, `src/app/inventario.html`, `src/app/inventario.css`.
*   **Función:** Módulo robusto para gestionar el inventario del colegio.
*   **Características:**
    - Registro de productos y categorías de insumos (alimentos, limpieza, papelería).
    - Control de stock por depósito (cada salón tiene un depósito asignado, además del Depósito General).
    - Módulo de Traslados para mover insumos entre depósitos con validación en tiempo real.
    - Registro de Colaboraciones y Recepciones de insumos donados o comprados.

### 9. `GestionCajaComponent`
*   **Archivos:** `src/app/gestion-caja.ts`, `src/app/gestion-caja.html`, `src/app/gestion-caja.css`.
*   **Función:** Módulo básico para reportar y consultar ingresos o egresos de dinero.

---

## 🌐 Comunicación con la API (Servicios)

La aplicación **no utiliza `HttpClient` de Angular**. En su lugar, realiza peticiones HTTP directas utilizando la API nativa de JavaScript **`fetch`** envuelta en bloques `try/catch` con soporte `async/await`.

### Ejemplo de Petición con Autenticación (Fetch):

```typescript
const token = localStorage.getItem('token');

const response = await fetch("http://localhost:5188/api/personal", {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});

if (response.ok) {
  this.empleados = await response.json();
} else if (response.status === 401) {
  // Manejo de expiración de sesión
  this.router.navigate(['/']);
}
```

---

## 🎨 Estilos y UI

- **CSS Vanilla:** Los estilos visuales se definen directamente en cada componente usando CSS tradicional, asegurando encapsulamiento estricto y excelente rendimiento.
- **FontAwesome:** Se consume desde un CDN en `src/index.html` para toda la iconografía de la aplicación (iconos de usuario, bloqueos, alertas, navegación).
- **Responsive Design:** Interfaces optimizadas con CSS Grid y Flexbox para adaptarse a pantallas de tablets, laptops y computadoras de escritorio.
