# 📦 Documentación de Tecnologías y Paquetes

Este documento detalla cada una de las tecnologías, librerías y paquetes de dependencias utilizados en el desarrollo del **Sistema de Gestión Escolar — Preescolar Juan Bautista Arismendi**.

---

## ⚙️ Backend (ASP.NET Core 10)

El backend está desarrollado sobre **.NET 10.0** utilizando C# como lenguaje principal y siguiendo un enfoque modular mediante controladores.

### Dependencias y Paquetes NuGet

#### 1. Entity Framework Core y Base de Datos
*   **`Microsoft.EntityFrameworkCore.SqlServer` (v8.0.10)**
    *   *Propósito:* Es el ORM (Object-Relational Mapper) oficial de Microsoft para interactuar con bases de datos SQL Server.
    *   *Uso:* Permite mapear las clases de C# (Entidades) directamente a tablas de la base de datos SQL Server, facilitando consultas seguras mediante LINQ y previniendo inyecciones SQL de forma nativa.
*   **`Microsoft.EntityFrameworkCore.Tools` (v8.0.10)**
    *   *Propósito:* Herramientas de consola para Entity Framework Core.
    *   *Uso:* Permite ejecutar comandos de migración de base de datos como `Add-Migration` y `Update-Database` desde la consola del administrador de paquetes NuGet o mediante el CLI de .NET (`dotnet ef`).

#### 2. Autenticación y Seguridad
*   **`Microsoft.AspNetCore.Authentication.JwtBearer` (v10.0.8)**
    *   *Propósito:* Middleware para validar tokens JWT (JSON Web Tokens).
    *   *Uso:* Habilita el atributo `[Authorize]` en los controladores de la API. Verifica que las peticiones entrantes contengan un token válido y no expirado en sus cabeceras antes de permitir el acceso a los datos.
*   **`System.IdentityModel.Tokens.Jwt` (v8.18.0)**
    *   *Propósito:* Herramientas para la creación y validación de tokens JWT.
    *   *Uso:* Utilizado en el método `GenerarTokenJWT` de `PersonalController` para generar la firma digital del token que se entrega al usuario en el inicio de sesión.

#### 3. Mapeo de Objetos (Data Mapping)
*   **`AutoMapper` (v13.0.1)**
    *   *Propósito:* Librería de mapeo de objetos a objetos.
    *   *Uso:* Copia automáticamente las propiedades de los modelos DTO (Data Transfer Objects) hacia las Entidades de la base de datos y viceversa. Esto evita tener que escribir código manual y repetitivo para copiar propiedades campo a campo.

#### 4. Documentación y Pruebas
*   **`Swashbuckle.AspNetCore` (v6.6.2)**
    *   *Propósito:* Integración de la especificación OpenAPI (Swagger).
    *   *Uso:* Genera dinámicamente un sitio interactivo de documentación en `http://localhost:5188/swagger` que permite a los desarrolladores explorar y probar todos los endpoints disponibles de la API directamente desde el navegador.

---

## 🖥️ Frontend (Angular 21)

El frontend está construido sobre la plataforma **Angular v21.2.0** en su configuración moderna orientada a componentes independientes (`standalone`).

### Dependencias Principales (`dependencies` en package.json)

*   **`@angular/core` (v21.2.0)**
    *   *Propósito:* El núcleo del framework Angular. Proporciona decoradores de componentes (`@Component`), detección de cambios, inyección de dependencias y el ciclo de vida de los componentes.
*   **`@angular/common` (v21.2.0)**
    *   *Propósito:* Contiene directivas, pipes y utilidades comunes integradas en el framework.
    *   *Uso:* Exporta directivas indispensables como `@if`, `@for` (sintaxis moderna de control de flujo), `NgClass` y `NgStyle`.
*   **`@angular/compiler` (v21.2.0)**
    *   *Propósito:* Compila los templates HTML y estilos CSS de Angular en código JavaScript altamente optimizado para el navegador.
*   **`@angular/forms` (v21.2.0)**
    *   *Propósito:* Habilita el manejo de formularios en Angular.
    *   *Uso:* Utilizado para el enlace de datos bidireccional (`[(ngModel)]`) en campos de entrada de formularios (ej. Login, registro de alumnos y personal).
*   **`@angular/router` (v21.2.0)**
    *   *Propósito:* Enrutamiento nativo para aplicaciones de una sola página (SPA).
    *   *Uso:* Permite navegar entre las vistas (Login, Menú, Inventario, etc.) sin recargar el sitio web completo en el navegador.
*   **`rxjs` (~7.8.0)**
    *   *Propósito:* Librería para programación reactiva basada en observables.
    *   *Uso:* Utilizado por Angular internamente para la gestión de eventos de enrutamiento y detección de estados.
*   **`tslib` (v2.3.0)**
    *   *Propósito:* Biblioteca de soporte para helpers de TypeScript en tiempo de ejecución. Reduce el tamaño del archivo JS generado final.

---

## 🛠️ Dependencias de Desarrollo (`devDependencies`)

Herramientas para garantizar la calidad del código, pruebas y formateo automático:

*   **`typescript` (~5.9.2)**
    *   *Propósito:* Superconjunto de JavaScript que añade tipado estático al código. Angular requiere TypeScript para transpilar el código a JavaScript compatible con todos los navegadores modernos.
*   **`vitest` (v4.0.8)**
    *   *Propósito:* Un framework de pruebas unitarias extremadamente rápido basado en Vite.
    *   *Uso:* Alternativa moderna y veloz a Karma/Jasmine para ejecutar las pruebas unitarias del frontend (`npm run test`).
*   **`jsdom` (v28.0.0)**
    *   *Propósito:* Una implementación en JavaScript pura del estándar DOM (Document Object Model) de W3C.
    *   *Uso:* Permite emular un navegador en la consola de comandos de Node.js para que `vitest` pueda ejecutar pruebas unitarias de los componentes de Angular sin abrir un navegador real.
*   **`prettier` (v3.8.1)**
    *   *Propósito:* Formateador de código con reglas estrictas.
    *   *Uso:* Garantiza que todo el equipo de desarrollo use las mismas reglas de indentación, uso de comillas y saltos de línea (`.prettierrc`).
*   **`@angular/cli` (v21.2.7) y `@angular/build` (v21.2.7)**
    *   *Propósito:* La interfaz de línea de comandos oficial de Angular y el motor de construcción.
    *   *Uso:* Proporciona comandos de desarrollo fundamentales como `ng serve` (servidor local), `ng build` (compilación para producción) y generación de nuevos componentes.
