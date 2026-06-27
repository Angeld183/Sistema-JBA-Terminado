# 🏫 Sistema de Gestión Escolar — Preescolar Juan Bautista Arismendi

Sistema integral de gestión administrativa para el Preescolar Juan Bautista Arismendi. Permite administrar personal, alumnos, inscripciones, salones, asistencia, inventario y gestión de caja desde una interfaz web moderna conectada a una API RESTful segura con autenticación JWT.

---

## 📑 Tabla de Contenido

- [Descripción General](#descripción-general)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Documentación Detallada](#documentación-detallada)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Autores](#autores)
- [Licencia](#licencia)

---

## Descripción General

Este sistema fue diseñado para digitalizar y optimizar los procesos administrativos del Preescolar Juan Bautista Arismendi, reemplazando los métodos manuales tradicionales con una plataforma web moderna y segura.

### Funcionalidades principales

| Módulo | Descripción |
|---|---|
| 🔐 **Autenticación** | Login con JWT, renovación automática de token cada 5 minutos, sistema de niveles jerárquicos |
| 👥 **Gestión de Personal** | CRUD completo de empleados con auditoría (quién creó, modificó o desactivó cada registro) |
| 🎓 **Inscripciones** | Registro de representantes, alumnos e inscripción en salones con validación de dependencias |
| 📚 **Salones (Matrículas)** | Configuración de aulas por sección, turno y capacidad. Asignación de docentes |
| ✅ **Asistencia** | Registro de entrada y salida del personal con marcas horarias |
| 📦 **Inventario** | Gestión completa de productos, depósitos, stock, traslados entre depósitos, colaboraciones con proveedores y recepciones |
| 💰 **Gestión de Caja** | Control de operaciones financieras del preescolar |

---

## Arquitectura del Proyecto

El proyecto sigue una arquitectura **cliente-servidor** de dos capas:

```
┌─────────────────────────────┐         ┌───────────────────────────────┐
│     FRONTEND (Angular 21)   │  HTTP   │    BACKEND (ASP.NET Core 10) │
│                             │◄───────►│                               │
│  • SPA (Single Page App)    │  REST   │  • API RESTful                │
│  • Standalone Components    │  + JWT  │  • Entity Framework Core      │
│  • Router con Lazy Loading  │         │  • SQL Server                 │
│  • Fetch API nativo         │         │  • AutoMapper                 │
│  • Puerto: 4200             │         │  • Swagger/OpenAPI            │
│                             │         │  • Puerto: 5188               │
└─────────────────────────────┘         └───────────────────────────────┘
```

---

## Tecnologías Utilizadas

### 🖥️ Frontend

| Tecnología | Versión | Descripción |
|---|---|---|
| **Angular** | 21.2.0 | Framework SPA principal con Standalone Components |
| **TypeScript** | 5.9.2 | Lenguaje de programación tipado sobre JavaScript |
| **RxJS** | 7.8.0 | Librería para programación reactiva con Observables |
| **Angular Router** | 21.2.0 | Enrutamiento SPA con rutas anidadas |
| **Angular Forms** | 21.2.0 | Manejo de formularios y `ngModel` |
| **Font Awesome** | CDN | Iconografía vectorial del sistema |
| **Vitest** | 4.0.8 | Framework de testing unitario |
| **Prettier** | 3.8.1 | Formateador de código |

### ⚙️ Backend (API)

| Tecnología | Versión | Descripción |
|---|---|---|
| **ASP.NET Core** | .NET 10.0 | Framework web para la API RESTful |
| **Entity Framework Core** | 8.0.10 | ORM para acceso a datos con SQL Server |
| **SQL Server** | — | Motor de base de datos relacional |
| **AutoMapper** | 13.0.1 | Mapeo automático de entidades a DTOs |
| **Swashbuckle (Swagger)** | 6.6.2 | Generación automática de documentación OpenAPI |
| **JWT Bearer** | 10.0.8 | Autenticación basada en tokens JWT |
| **System.IdentityModel.Tokens.Jwt** | 8.18.0 | Generación y validación de tokens JWT |

### 🛠️ Herramientas de Desarrollo

| Herramienta | Uso |
|---|---|
| **Angular CLI** | Scaffolding, build y servidor de desarrollo |
| **npm** | Gestor de paquetes del frontend |
| **NuGet** | Gestor de paquetes del backend (.NET) |
| **Git** | Control de versiones |
| **VS Code** | IDE de desarrollo |

---

## Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- **Node.js** >= 20.x y **npm** >= 11.x
- **.NET SDK** >= 10.0
- **SQL Server** (local o remoto)
- **Git**

---

## Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/mi-proyecto-angular.git
cd mi-proyecto-angular
```

### 2. Backend (API)

```bash
# Navegar al proyecto de la API
cd ApiJBA/ApiJBA

# Restaurar paquetes NuGet
dotnet restore

# Configurar la cadena de conexión en appsettings.json
# (Editar "DefaultConnection" con tu servidor SQL Server)

# Aplicar migraciones a la base de datos
dotnet ef database update

# Ejecutar la API
dotnet run
```

> La API estará disponible en `http://localhost:5188`
> Swagger UI: `http://localhost:5188/swagger`

### 3. Frontend (Angular)

```bash
# Volver a la raíz del proyecto
cd ../..

# Instalar dependencias
npm install

# Ejecutar el servidor de desarrollo
npm start
```

> La aplicación estará disponible en `http://localhost:4200`

---

## Documentación Detallada

| Documento | Descripción |
|---|---|
| 📡 [Documentación de la API](./docs/API.md) | Endpoints, autenticación JWT, DTOs, códigos de respuesta |
| 🖼️ [Documentación del Frontend](./docs/FRONTEND.md) | Componentes Angular, rutas, módulos, flujo de navegación |
| 📦 [Documentación de Paquetes y Tecnologías](./docs/TECNOLOGIAS.md) | Detalle completo de cada dependencia y su función en el proyecto |

---

## Estructura del Proyecto

```
mi-proyecto-angular/
│
├── 📁 src/                          # Código fuente del Frontend (Angular)
│   ├── 📁 app/                      # Componentes de la aplicación
│   │   ├── app.ts                   # Componentes: Login, Menu, Empleados
│   │   ├── app.routes.ts            # Definición de rutas
│   │   ├── app.config.ts            # Configuración de la aplicación
│   │   ├── inscripcion.ts/html/css  # Módulo de Inscripciones
│   │   ├── alumnos-inscritos.ts/html# Módulo de Alumnos Inscritos
│   │   ├── salones.ts/html/css      # Módulo de Salones/Matrículas
│   │   ├── asistencia.ts/html/css   # Módulo de Asistencia
│   │   ├── inventario.ts/html/css   # Módulo de Inventario
│   │   ├── gestion-caja.ts/html/css # Módulo de Gestión de Caja
│   │   ├── Login.html               # Template del Login
│   │   ├── Menu.html/css            # Template y estilos del Menú
│   │   └── Empleados.html/css       # Template y estilos de Empleados
│   ├── index.html                   # Punto de entrada HTML
│   ├── main.ts                      # Bootstrap de Angular
│   └── styles.css                   # Estilos globales
│
├── 📁 ApiJBA/ApiJBA/                # Código fuente del Backend (API .NET)
│   ├── 📁 Controllers/              # Controladores REST (17 controllers)
│   ├── 📁 Entidades/                # Modelos de datos / Entidades EF Core
│   ├── 📁 DTOs/                     # Data Transfer Objects
│   ├── 📁 Migrations/               # Migraciones de Entity Framework
│   ├── 📁 Database/                 # Scripts de base de datos
│   ├── 📁 Utilidades/               # Clases de utilidad
│   ├── ApplicationDbContext.cs      # Contexto de EF Core y relaciones
│   ├── Startup.cs                   # Configuración de servicios y middleware
│   ├── Program.cs                   # Punto de entrada de la API
│   └── appsettings.json             # Configuración de la aplicación
│
├── 📁 docs/                         # Documentación del proyecto
│   ├── API.md                       # Documentación de la API
│   ├── FRONTEND.md                  # Documentación del Frontend
│   └── TECNOLOGIAS.md               # Documentación de Tecnologías
│
├── package.json                     # Dependencias npm del Frontend
├── angular.json                     # Configuración de Angular CLI
├── tsconfig.json                    # Configuración de TypeScript
└── .gitignore                       # Archivos excluidos de Git
```

---

## Sistema de Roles y Niveles

El sistema implementa un control de acceso basado en niveles jerárquicos:

| Nivel | Cargo | Acceso |
|---|---|---|
| 10 | Sistemas | Acceso total al sistema |
| 9 | Director | Administración completa |
| 8 | Subdirector | Operaciones administrativas |
| 7 | Secretaria | Operaciones operativas básicas |
| 1–6 | Personal General / Vocero | Sin acceso al sistema web |

> **Nota:** Solo los niveles ≥ 7 pueden iniciar sesión en el sistema. Un usuario solo puede crear, modificar o desactivar a usuarios de su mismo nivel o inferior.

---

## Autores

- Equipo de desarrollo del Preescolar Juan Bautista Arismendi

## Licencia

Este proyecto es de uso interno para el Preescolar Juan Bautista Arismendi.
