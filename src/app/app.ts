import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router'; // 👈 RouterLink para el menú lateral
import { CommonModule } from '@angular/common'; // 👈 CommonModule para las directivas estructurales
import { FormsModule } from '@angular/forms'; // 👈 Importar FormsModule para usar ngModel

// ==========================================
// 1. COMPONENTE DEL LOGIN
// ==========================================
@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './Login.html', 
  styleUrl: './app.css',       
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginComponent {
  loading: boolean = false;
  errorMessage: string = "";

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  async ingresar(cedula: string, contrasena: string): Promise<void> {
    this.errorMessage = "";
    const cleanCedula = cedula ? cedula.trim() : "";
    const cleanContrasena = contrasena ? contrasena.trim() : "";

    if (!cleanCedula) {
      this.errorMessage = "Por favor, ingrese su Cédula de Identidad.";
      return;
    }

    if (!cleanContrasena) {
      this.errorMessage = "Por favor, ingrese su Contraseña.";
      return;
    }

    this.loading = true;

    try {
      const response = await fetch("http://localhost:5188/api/personal/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ci_p: cleanCedula, contrasena: cleanContrasena })
      });

      let data: any = {};
      try {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { mensaje: text };
        }
      } catch (err) {
        data = { mensaje: "Error al leer respuesta de la API." };
      }

      if (response.ok) {
        // Guardar sesión en localStorage
        localStorage.setItem("jba_token", data.token);
        localStorage.setItem("jba_token_exp", data.expiracion);
        localStorage.setItem("jba_user", JSON.stringify(data.usuario));
        this.router.navigate(['/menu']);
      } else {
        this.errorMessage = data.mensaje || "Usuario o contraseña incorrectos.";
      }
    } catch (error) {
      console.error("Error al conectar con la API:", error);
      this.errorMessage = "No se pudo conectar con el servidor. Asegúrese de que el backend esté encendido.";
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  togglePassword(): void {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    }
  }
}

// ==========================================
// 2. COMPONENTE DEL MENÚ (LOBBY)
// ==========================================
@Component({
  selector: 'app-menu',
  standalone: true, 
  imports: [RouterOutlet, RouterLink, CommonModule], // 👈 Habilita submenús dinámicos y enrutamiento en la barra lateral
  templateUrl: './Menu.html', 
  styleUrl: './Menu.css',     
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MenuComponent implements OnInit {
  // Variables de control de flujo con tipado estricto explícito
  submenuPersonalAbierto: boolean = false;
  submenuInscripcionesAbierto: boolean = false; 
  submenuMatriculasAbierto: boolean = false;    
  submenuFondosAbierto: boolean = false;

  // Propiedad de control de flujo para el menú de Asistencia
  submenuAsistenciaAbierto: boolean = false;

  userDisplayName: string = "";
  modulosAsignados: string[] = [];

  constructor(public router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem("jba_token");
    const exp = localStorage.getItem("jba_token_exp");

    if (!token || !exp) {
      this.router.navigate(['/']);
      return;
    }

    const expDate = new Date(exp);
    const now = new Date();
    if (now >= expDate) {
      alert("Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.");
      this.salir();
      return;
    }

    const userJson = localStorage.getItem("jba_user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.userDisplayName = `Hola, ${user.nombre_p} (${user.cargo || 'Usuario'})`;

        // Cargar permisos de módulos asignados
        if (user.nivel === 10) {
          this.modulosAsignados = ['Personal', 'Inscripciones', 'Matriculas', 'Fondos', 'Asistencia', 'Inventario'];
        } else if (user.modulos_asignados) {
          this.modulosAsignados = user.modulos_asignados.split(',').map((m: string) => m.trim());
        } else {
          // Por defecto, si es nulo (usuarios creados anteriormente), tiene acceso total
          this.modulosAsignados = ['Personal', 'Inscripciones', 'Matriculas', 'Fondos', 'Asistencia', 'Inventario'];
        }
      } catch (e) {
        console.error("Error al procesar los datos de usuario:", e);
      }
    }
  }

  tieneAcceso(modulo: string): boolean {
    return this.modulosAsignados.includes(modulo);
  }

  toggleSubmenu(event: Event): void {
    event.preventDefault();
    this.submenuPersonalAbierto = !this.submenuPersonalAbierto;
  }

  toggleSubmenuInscripciones(event: Event): void {
    event.preventDefault();
    this.submenuInscripcionesAbierto = !this.submenuInscripcionesAbierto;
  }

  toggleSubmenuMatriculas(event: Event): void {
    event.preventDefault();
    this.submenuMatriculasAbierto = !this.submenuMatriculasAbierto;
  }

  toggleSubmenuFondos(event: Event): void {
    event.preventDefault();
    this.submenuFondosAbierto = !this.submenuFondosAbierto;
  }

  // Método de apertura y cierre para Asistencia
  toggleSubmenuAsistencia(event: Event): void {
    event.preventDefault();
    this.submenuAsistenciaAbierto = !this.submenuAsistenciaAbierto;
  }

  salir(): void {
    localStorage.removeItem("jba_token");
    localStorage.removeItem("jba_token_exp");
    localStorage.removeItem("jba_user");
    this.router.navigate(['/']); 
  }
}

// ==========================================
// 3. INTERFACE DE DATOS (Para el módulo Empleados)
// ==========================================
interface Empleado {
  nombre: string;
  cedula: string;
  telefono: string;
  cargo: string;
  aula?: string;
  seccion?: string;
  id_aula?: number;
  suplenteCi?: string;
  suplenteNombre?: string;
  turnoCi?: string;
  turnoNombre?: string;
  iniciales: string;
  claseColor: string;
  oculto: boolean;
  nivel: number;
  estado: boolean;
  modulos_asignados?: string;
}

// ==========================================
// 4. COMPONENTE DE GESTIÓN DE EMPLEADOS
// ==========================================
@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule], // 👈 Permite usar @if, @for, ngClass y ngModel en empleados.html
  templateUrl: './Empleados.html', 
  styleUrl: './Empleados.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EmpleadosComponent implements OnInit {
  modalAbierto: boolean = false;
  esDocente: boolean = false;
  loading: boolean = false;
  errorMessage: string = "";
  editando: boolean = false;
  empleadoAEditar: any = {};
  nivelUsuarioLogueado: number = 1;

  listaEmpleados: Empleado[] = [];
  matriculasDisponibles: any[] = [];
  aulaSeleccionada: string = "";
  seccionSeleccionada: string = "";

  // Vista de inactivos y asignación de módulos
  mostrarInactivos: boolean = false;
  todosLosEmpleadosRaw: any[] = [];
  modalModulosAbierto: boolean = false;
  modulosSeleccionados: { [key: string]: boolean } = {
    Personal: false,
    Inscripciones: false,
    Matriculas: false,
    Fondos: false,
    Asistencia: false
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem("jba_user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.nivelUsuarioLogueado = user.nivel || 1;
      } catch (e) {
        console.error("Error al procesar nivel de usuario:", e);
      }
    }
    this.cargarEmpleados();
    this.cargarMatriculas();
  }

  async cargarMatriculas(): Promise<void> {
    const token = localStorage.getItem("jba_token");
    if (!token) return;
    try {
      const response = await fetch("http://localhost:5188/api/matriculas", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        this.matriculasDisponibles = await response.json();
      }
    } catch (e) {
      console.error("Error al cargar matrículas en EmpleadosComponent:", e);
    }
  }

  alSeleccionarAula(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const idAula = select.value ? parseInt(select.value, 10) : 0;
    const matricula = this.matriculasDisponibles.find(m => m.id_aula === idAula);
    if (matricula) {
      this.aulaSeleccionada = matricula.aula;
      this.seccionSeleccionada = matricula.seccion;
    } else {
      this.aulaSeleccionada = "";
      this.seccionSeleccionada = "";
    }
  }

  async cargarEmpleados(): Promise<void> {
    this.loading = true;
    this.errorMessage = "";
    const token = localStorage.getItem("jba_token");

    try {
      const response = await fetch("http://localhost:5188/api/personal", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("No tienes permisos suficientes o tu sesión ha expirado.");
        }
        throw new Error(`Error en el servidor: ${response.status}`);
      }

      const personal = await response.json();
      this.todosLosEmpleadosRaw = personal;
      
      // Filtrar los empleados según la vista (activos o inactivos)
      const filtrados = personal.filter((emp: any) => emp.estado === !this.mostrarInactivos);

      this.listaEmpleados = filtrados.map((emp: any) => {
        const iniciales = emp.nombre_p.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
        const claseColor = emp.nivel >= 7 ? 'circle-red' : 'circle-orange';

        let aula = "";
        let seccion = "";
        let telefono = "";
        let id_aula: number | undefined;
        let suplenteCi = "";
        let suplenteNombre = "";
        let turnoCi = "";
        let turnoNombre = "";

        try {
          if (emp.tipo_preparacion) {
            const prep = JSON.parse(emp.tipo_preparacion);
            aula = prep.aula || "";
            seccion = prep.seccion || "";
            telefono = prep.telefono || "";
            id_aula = prep.id_aula ? parseInt(prep.id_aula, 10) : undefined;
            suplenteCi = prep.suplenteCi || "";
            suplenteNombre = prep.suplenteNombre || "";
            turnoCi = prep.turnoCi || "";
            turnoNombre = prep.turnoNombre || "";
          }
        } catch (e) {
          telefono = emp.tipo_preparacion || "";
        }

        return {
          nombre: emp.nombre_p,
          cedula: emp.ci_p,
          telefono: telefono,
          cargo: emp.cargo || 'Personal',
          aula: aula,
          seccion: seccion,
          id_aula: id_aula,
          suplenteCi: suplenteCi,
          suplenteNombre: suplenteNombre,
          turnoCi: turnoCi,
          turnoNombre: turnoNombre,
          iniciales: iniciales,
          claseColor: claseColor,
          oculto: true,
          nivel: emp.nivel,
          estado: emp.estado,
          modulos_asignados: emp.modulos_asignados
        };
      });
      this.cdr.detectChanges();

    } catch (error: any) {
      console.error("Error al cargar personal:", error);
      this.errorMessage = error.message || "Error al conectar con la base de datos.";
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  abrirModal(): void {
    this.editando = false;
    this.empleadoAEditar = {};
    this.modalAbierto = true;
    this.esDocente = false; 
    this.aulaSeleccionada = "";
    this.seccionSeleccionada = "";
  }

  abrirModalEdicion(empleado: Empleado): void {
    this.editando = true;
    this.empleadoAEditar = { ...empleado };
    this.esDocente = empleado.cargo === 'Docente';
    this.aulaSeleccionada = empleado.aula || "";
    this.seccionSeleccionada = empleado.seccion || "";
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.editando = false;
    this.empleadoAEditar = {};
  }

  evaluarCargo(cargo: string): void {
    this.esDocente = cargo === 'Docente';
  }

  async registrarEmpleado(event: Event): Promise<void> {
    event.preventDefault();
    const token = localStorage.getItem("jba_token");
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const nombre = formData.get('nombre') as string;
    const cedula = formData.get('cedula') as string;
    const telefono = formData.get('telefono') as string;
    const cargo = formData.get('cargo') as string;
    const nivelSelected = formData.get('nivel') as string;
    const contrasena = formData.get('contrasena') as string;
    const idAulaSelected = formData.get('id_aula') as string;
    const suplenteCi = formData.get('suplente') as string;
    const turnoCi = formData.get('turnoDocente') as string;

    const id_aula = idAulaSelected ? parseInt(idAulaSelected, 10) : null;
    const suplente = this.listaEmpleados.find(e => e.cedula === suplenteCi);
    const suplenteNombre = suplente ? suplente.nombre : "";
    const turnoDoc = this.listaEmpleados.find(e => e.cedula === turnoCi);
    const turnoNombre = turnoDoc ? turnoDoc.nombre : "";

    const aula = id_aula ? this.aulaSeleccionada : "";
    const seccion = id_aula ? this.seccionSeleccionada : "";

    const nivel = parseInt(nivelSelected, 10) || 1;

    const prepObj = {
      id_aula: id_aula,
      aula: aula,
      seccion: seccion,
      telefono: telefono,
      suplenteCi: suplenteCi || "",
      suplenteNombre: suplenteNombre,
      turnoCi: turnoCi || "",
      turnoNombre: turnoNombre
    };

    const payload = {
      ci_p: cedula,
      nombre_p: nombre,
      contrasena: contrasena,
      nivel: nivel,
      estado: true,
      cargo: cargo,
      fecha_registro: new Date().toISOString(),
      direccion_p: "Por definir", 
      correo_p: "",
      foto_p: "",
      fecha_voucher: null,
      tipo_preparacion: JSON.stringify(prepObj)
    };

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Registrando...";

    try {
      const response = await fetch("http://localhost:5188/api/personal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Si es docente y tiene aula asignada, actualizar la aula/matrícula en la DB
        if (cargo === 'Docente' && id_aula) {
          const matFind = this.matriculasDisponibles.find(m => m.id_aula === id_aula);
          if (matFind) {
            const motivoObj = {
              suplenteCi: suplenteCi || "",
              suplenteNombre: suplenteNombre,
              turnoCi: turnoCi || "",
              turnoNombre: turnoNombre
            };

            const matPayload = {
              seccion: matFind.seccion,
              aula: matFind.aula,
              turno: matFind.turno,
              ci_p: cedula,
              capacidad: matFind.capacidad,
              varones: matFind.varones,
              hembras: matFind.hembras,
              estado_m: matFind.estado_m,
              motivo_m: JSON.stringify(motivoObj)
            };

            await fetch(`http://localhost:5188/api/matriculas/${id_aula}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify(matPayload)
            });
          }
        }

        await this.cargarEmpleados();
        this.cerrarModal();
      } else {
        const text = await response.text();
        let message = "Intente nuevamente.";
        try {
          const errData = JSON.parse(text);
          message = errData.mensaje || (errData.errors ? Object.values(errData.errors).flat().join(", ") : text);
        } catch {
          message = text;
        }
        alert(`Error al registrar: ${message}`);
      }
    } catch (error) {
      console.error("Error al registrar personal:", error);
      alert("No se pudo conectar con el servidor para registrar al empleado.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  async guardarEdicion(event: Event): Promise<void> {
    event.preventDefault();
    const token = localStorage.getItem("jba_token");
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const nombre = formData.get('nombre') as string;
    const cedula = this.empleadoAEditar.cedula; 
    const telefono = formData.get('telefono') as string;
    const cargo = formData.get('cargo') as string;
    const nivelSelected = formData.get('nivel') as string;
    const contrasena = formData.get('contrasena') as string;
    const idAulaSelected = formData.get('id_aula') as string;
    const suplenteCi = formData.get('suplente') as string;
    const turnoCi = formData.get('turnoDocente') as string;

    const id_aula = idAulaSelected ? parseInt(idAulaSelected, 10) : null;
    const suplente = this.listaEmpleados.find(e => e.cedula === suplenteCi);
    const suplenteNombre = suplente ? suplente.nombre : "";
    const turnoDoc = this.listaEmpleados.find(e => e.cedula === turnoCi);
    const turnoNombre = turnoDoc ? turnoDoc.nombre : "";

    const aula = id_aula ? this.aulaSeleccionada : "";
    const seccion = id_aula ? this.seccionSeleccionada : "";

    const nivel = parseInt(nivelSelected, 10) || 1;

    const prepObj = {
      id_aula: id_aula,
      aula: aula,
      seccion: seccion,
      telefono: telefono,
      suplenteCi: suplenteCi || "",
      suplenteNombre: suplenteNombre,
      turnoCi: turnoCi || "",
      turnoNombre: turnoNombre
    };

    const payload = {
      ci_p: cedula,
      nombre_p: nombre,
      contrasena: contrasena || null, 
      nivel: nivel,
      estado: this.empleadoAEditar.estado !== undefined ? this.empleadoAEditar.estado : true,
      cargo: cargo,
      fecha_registro: new Date().toISOString(),
      direccion_p: "Por definir", 
      correo_p: "",
      foto_p: "",
      fecha_voucher: null,
      tipo_preparacion: JSON.stringify(prepObj),
      modulos_asignados: this.empleadoAEditar.modulos_asignados || null
    };

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Guardando...";

    try {
      const response = await fetch(`http://localhost:5188/api/personal/${cedula}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Si es docente y tiene aula asignada, actualizar la aula/matrícula en la DB
        if (cargo === 'Docente' && id_aula) {
          const matFind = this.matriculasDisponibles.find(m => m.id_aula === id_aula);
          if (matFind) {
            const motivoObj = {
              suplenteCi: suplenteCi || "",
              suplenteNombre: suplenteNombre,
              turnoCi: turnoCi || "",
              turnoNombre: turnoNombre
            };

            const matPayload = {
              seccion: matFind.seccion,
              aula: matFind.aula,
              turno: matFind.turno,
              ci_p: cedula,
              capacidad: matFind.capacidad,
              varones: matFind.varones,
              hembras: matFind.hembras,
              estado_m: matFind.estado_m,
              motivo_m: JSON.stringify(motivoObj)
            };

            await fetch(`http://localhost:5188/api/matriculas/${id_aula}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify(matPayload)
            });
          }
        }

        await this.cargarEmpleados();
        this.cerrarModal();
      } else {
        const text = await response.text();
        let message = "Intente nuevamente.";
        try {
          const errData = JSON.parse(text);
          message = errData.mensaje || (errData.errors ? Object.values(errData.errors).flat().join(", ") : text);
        } catch {
          message = text;
        }
        alert(`Error al guardar cambios: ${message}`);
      }
    } catch (error) {
      console.error("Error al guardar personal:", error);
      alert("No se pudo conectar con el servidor para guardar los cambios.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  async desactivarEmpleado(empleado: Empleado): Promise<void> {
    const confirmar = confirm(`¿Seguro que deseas desactivar a "${empleado.nombre}"? Ya no podrá acceder al sistema.`);
    if (!confirmar) return;

    const token = localStorage.getItem("jba_token");

    try {
      const response = await fetch(`http://localhost:5188/api/personal/desactivar/${empleado.cedula}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        alert("Personal desactivado con éxito.");
        await this.cargarEmpleados();
        this.cdr.detectChanges();
      } else {
        const text = await response.text();
        let message = "Intente nuevamente.";
        try {
          const errData = JSON.parse(text);
          message = errData.mensaje || text;
        } catch {
          message = text;
        }
        alert(`Error al desactivar: ${message}`);
      }
    } catch (error) {
      console.error("Error al desactivar personal:", error);
      alert("No se pudo conectar con el servidor para desactivar al empleado.");
    }
  }

  async activarEmpleado(empleado: Empleado): Promise<void> {
    const confirmar = confirm(`¿Seguro que deseas activar nuevamente a "${empleado.nombre}"?`);
    if (!confirmar) return;

    const token = localStorage.getItem("jba_token");

    try {
      const response = await fetch(`http://localhost:5188/api/personal/activar/${empleado.cedula}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        alert("Personal activado con éxito.");
        await this.cargarEmpleados();
        this.cdr.detectChanges();
      } else {
        const text = await response.text();
        let message = "Intente nuevamente.";
        try {
          const errData = JSON.parse(text);
          message = errData.mensaje || text;
        } catch {
          message = text;
        }
        alert(`Error al activar: ${message}`);
      }
    } catch (error) {
      console.error("Error al activar personal:", error);
      alert("No se pudo conectar con el servidor para activar al empleado.");
    }
  }

  toggleVerInactivos(): void {
    this.mostrarInactivos = !this.mostrarInactivos;
    this.cargarEmpleados();
  }

  exportarEmpleadosExcel(): void {
    if (this.todosLosEmpleadosRaw.length === 0) {
      alert("No hay empleados para exportar.");
      return;
    }

    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
    html += `<head><meta charset="utf-8">`;
    html += `<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Personal JBA</x:Name>`;
    html += `<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->`;
    html += `<style>`;
    html += `table { border-collapse: collapse; font-family: Segoe UI, sans-serif; }`;
    html += `th { background-color: #1e3a8a; color: white; font-weight: bold; border: 1px solid #cbd5e1; padding: 10px; text-align: center; }`;
    html += `td { border: 1px solid #cbd5e1; padding: 8px; text-align: center; }`;
    html += `.header-title { font-size: 16px; font-weight: bold; color: #1e3a8a; text-align: center; padding: 15px; }`;
    html += `.status-active { color: #16a34a; font-weight: bold; }`;
    html += `.status-inactive { color: #dc2626; font-weight: bold; }`;
    html += `</style></head><body>`;

    html += `<table>`;
    html += `<tr><td colspan="10" class="header-title">REPORTE GENERAL DE PERSONAL JBA - ACTIVO E INACTIVO</td></tr>`;
    html += `<tr>`;
    html += `<th>CÉDULA</th>`;
    html += `<th>NOMBRE Y APELLIDO</th>`;
    html += `<th>CARGO</th>`;
    html += `<th>NIVEL</th>`;
    html += `<th>ESTADO</th>`;
    html += `<th>TELÉFONO</th>`;
    html += `<th>DIRECCIÓN</th>`;
    html += `<th>CORREO ELECTRÓNICO</th>`;
    html += `<th>FECHA REGISTRO</th>`;
    html += `<th>AULA / SECCIÓN</th>`;
    html += `</tr>`;

    this.todosLosEmpleadosRaw.forEach(emp => {
      let tel = "";
      let aula = "";
      let seccion = "";
      try {
        if (emp.tipo_preparacion) {
          const prep = JSON.parse(emp.tipo_preparacion);
          tel = prep.telefono || "";
          aula = prep.aula || "";
          seccion = prep.seccion || "";
        }
      } catch {
        tel = emp.tipo_preparacion || "";
      }

      html += `<tr>`;
      html += `<td>${emp.ci_p}</td>`;
      html += `<td style="text-align: left;">${emp.nombre_p}</td>`;
      html += `<td>${emp.cargo || 'Personal'}</td>`;
      html += `<td>${emp.nivel}</td>`;
      html += `<td class="${emp.estado ? 'status-active' : 'status-inactive'}">${emp.estado ? 'Activo' : 'Inactivo'}</td>`;
      html += `<td>${tel}</td>`;
      html += `<td style="text-align: left;">${emp.direccion_p || 'N/A'}</td>`;
      html += `<td>${emp.correo_p || 'N/A'}</td>`;
      html += `<td>${emp.fecha_registro ? new Date(emp.fecha_registro).toLocaleDateString() : 'N/A'}</td>`;
      html += `<td>${aula ? aula + ' - ' + seccion : 'N/A'}</td>`;
      html += `</tr>`;
    });

    html += `</table></body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Reporte_Personal_JBA_${new Date().toISOString().substring(0,10)}.xls`);
    a.click();
    window.URL.revokeObjectURL(url);
  }

  abrirModalModulos(empleado: Empleado): void {
    this.empleadoAEditar = { ...empleado };
    
    // Reset permissions
    this.modulosSeleccionados = {
      Personal: false,
      Inscripciones: false,
      Matriculas: false,
      Fondos: false,
      Asistencia: false
    };

    if (empleado.modulos_asignados) {
      const modulos = empleado.modulos_asignados.split(',').map(m => m.trim());
      modulos.forEach(m => {
        if (m in this.modulosSeleccionados) {
          this.modulosSeleccionados[m] = true;
        }
      });
    }
    
    this.modalModulosAbierto = true;
    this.cdr.detectChanges();
  }

  cerrarModalModulos(): void {
    this.modalModulosAbierto = false;
    this.cdr.detectChanges();
  }

  async guardarModulos(): Promise<void> {
    const token = localStorage.getItem("jba_token");
    const selectos = Object.keys(this.modulosSeleccionados).filter(k => this.modulosSeleccionados[k]);
    const modulosString = selectos.join(',');

    const prepObj = {
      id_aula: this.empleadoAEditar.id_aula || null,
      aula: this.empleadoAEditar.aula || "",
      seccion: this.empleadoAEditar.seccion || "",
      telefono: this.empleadoAEditar.telefono || "",
      suplenteCi: this.empleadoAEditar.suplenteCi || "",
      suplenteNombre: this.empleadoAEditar.suplenteNombre || "",
      turnoCi: this.empleadoAEditar.turnoCi || "",
      turnoNombre: this.empleadoAEditar.turnoNombre || ""
    };

    const payload = {
      ci_p: this.empleadoAEditar.cedula,
      nombre_p: this.empleadoAEditar.nombre,
      contrasena: null, // Keep existing password
      nivel: this.empleadoAEditar.nivel,
      estado: this.empleadoAEditar.estado !== undefined ? this.empleadoAEditar.estado : true,
      cargo: this.empleadoAEditar.cargo,
      fecha_registro: new Date().toISOString(),
      direccion_p: "Por definir",
      correo_p: "",
      foto_p: "",
      fecha_voucher: null,
      tipo_preparacion: JSON.stringify(prepObj),
      modulos_asignados: modulosString || null
    };

    try {
      const response = await fetch(`http://localhost:5188/api/personal/${this.empleadoAEditar.cedula}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Módulos asignados con éxito.");
        await this.cargarEmpleados();
        this.cerrarModalModulos();
      } else {
        const text = await response.text();
        alert(`Error al guardar módulos: ${text}`);
      }
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar la asignación de módulos.");
    }
  }
}

// ==========================================
// 5. COMPONENTE MAESTRO GLOBAL (RAÍZ)
// ==========================================
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], 
  templateUrl: './enrutador_master_global.html' 
})
export class App {}