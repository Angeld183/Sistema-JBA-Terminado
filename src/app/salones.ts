import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-salones',
  standalone: true,
  imports: [CommonModule, FormsModule], // Importaciones clave para ngModel, @if y @for
  templateUrl: './salones.html',
  styleUrls: ['./salones.css'] // 👈 Asegúrate de que coincida con tus mayúsculas/minúsculas (Salones.css)
})
export class SalonesComponent implements OnInit {
  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  redirigirANuevaInscripcion() {
    this.router.navigate(['/menu/nueva-inscripcion']);
  }
  // Variables de control de estado y flujos
  salaSeleccionada: string = '';
  seccionSeleccionada: string = '';
  nivelActual: number = 1; 
  modoBusquedaActivo: boolean = false;
  terminoBusqueda: string = '';
  textoSubHeaderLista: string = '';
  
  // Almacenamiento dinámico de colecciones filtradas
  seccionesFiltradas: string[] = [];
  alumnosSeccion: any[] = [];
  resultadosBusqueda: any[] = [];
  alumnoSeleccionado: any = null;

  // Configuración estática inicializada para renderizar las salas
  salasConfig = [
    { id: '3', nombre: 'Sala 3', secciones: ['A', 'B', 'C'], seccionesTexto: 'A, B y C' },
    { id: '4', nombre: 'Sala 4', secciones: ['A', 'B', 'C', 'D'], seccionesTexto: 'A, B, C y D' },
    { id: '5', nombre: 'Sala 5', secciones: ['A', 'B', 'C', 'D', 'E'], seccionesTexto: 'A, B, C, D y E' }
  ];

  baseDatosAlumnos: any[] = [];
  personalList: any[] = [];
  matriculasList: any[] = [];

  ngOnInit() {
    this.nivelActual = 1;
    this.cargarDatosAlumnos();
  }

  async cargarDatosAlumnos() {
    const token = localStorage.getItem("jba_token");
    if (!token) return;

    try {
      const [aluResp, inscResp, repResp, matResp, persResp] = await Promise.all([
        fetch("http://localhost:5188/api/alumnos", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://localhost:5188/api/inscripciones", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://localhost:5188/api/representantes", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://localhost:5188/api/matriculas", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://localhost:5188/api/personal", { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      if (!aluResp.ok || !inscResp.ok || !repResp.ok || !matResp.ok || !persResp.ok) {
        throw new Error("Error al obtener datos del servidor.");
      }

      const alumnos = await aluResp.json();
      const inscripciones = await inscResp.json();
      const representantes = await repResp.json();
      this.matriculasList = await matResp.json();
      this.personalList = await persResp.json();

      // Filtrar solo alumnos activos (estado_alumno === 1)
      const alumnosActivos = alumnos.filter((a: any) => a.estado_alumno === 1);

      this.baseDatosAlumnos = alumnosActivos.map((alumno: any) => {
        const rep = representantes.find((r: any) => r.ci_representante === alumno.ci_representante);
        
        // Obtener la inscripción más reciente para el aula
        const studentInscs = inscripciones.filter((i: any) => i.ci_alumno === alumno.ci_alumno);
        let insc = null;
        if (studentInscs.length > 0) {
          studentInscs.sort((a: any, b: any) => b.id_inscripcion - a.id_inscripcion);
          insc = studentInscs[0];
        }
        
        let sala = "Sin Aula Asignada";
        let seccion = "";
        if (insc) {
          const mat = this.matriculasList.find((m: any) => m.id_aula === insc.id_aula);
          if (mat) {
            sala = mat.aula;
            seccion = mat.seccion;
          }
        }

        const anio = sala.replace(/\D/g, "");

        let repTelefono = "";
        let telMadre = "";
        let telPadre = "";
        if (rep && rep.motivo_r) {
          try {
            const contacto = JSON.parse(rep.motivo_r);
            repTelefono = contacto.repTelefono || "";
            telMadre = contacto.telMadre || "";
            telPadre = contacto.telPadre || "";
          } catch (e) {
            // No era JSON
          }
        }

        return {
          nombre: alumno.nombre_alumno,
          anio: anio || "3",
          seccion: seccion || "A",
          cedula: alumno.ci_alumno,
          estado: "Inscrito",
          motivo: alumno.motivo_a || "Nuevo Ingreso",
          fechaReg: alumno.fecha_registro_a ? alumno.fecha_registro_a.substring(0, 10) : "",
          fechaSal: alumno.fecha_salida_a ? alumno.fecha_salida_a.substring(0, 10) : "N/A",
          edad: alumno.edad_alumno ? alumno.edad_alumno.toString() : "3",
          sexo: alumno.sexo === "M" ? "Masculino" : (alumno.sexo === "F" ? "Femenino" : alumno.sexo),
          repre: rep ? rep.nombre_representante : "N/A",
          repreCedula: alumno.ci_representante,
          historial: alumno.cardiovascular || "Sin observaciones médicas relevantes registradas.",
          ciMadre: rep ? rep.ci_madre : "",
          nombreMadre: rep ? rep.nombre_madre : "",
          telMadre: telMadre,
          ciPadre: rep ? rep.ci_padre : "",
          nombrePadre: rep ? rep.nombre_padre : "",
          telPadre: telPadre
        };
      });

      if (this.nivelActual === 3) {
        this.irAAlumnos(this.seccionSeleccionada);
      } else if (this.modoBusquedaActivo) {
        this.ejecutarBusquedaGlobal();
      }
      this.cdr.detectChanges();

    } catch (e) {
      console.error("Error al cargar salones desde la API:", e);
      this.cdr.detectChanges();
    }
  }

  // Lógica del buscador global reactivo
  ejecutarBusquedaGlobal() {
    const query = this.terminoBusqueda.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (query === "") {
      this.modoBusquedaActivo = false;
      return;
    }

    this.modoBusquedaActivo = true;
    this.resultadosBusqueda = this.baseDatosAlumnos.filter(alumno => {
      const nombreLimpio = alumno.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      return nombreLimpio.includes(query) || alumno.cedula.includes(query);
    });
  }

  // Navegación: Ir a Secciones de una Sala
  irASecciones(sala: string, listaSecciones: string[]) {
    this.salaSeleccionada = sala; 
    this.nivelActual = 2;
    this.seccionesFiltradas = listaSecciones;
  }

  // Navegación: Listar Alumnos de una Sección
  irAAlumnos(seccion: string) {
    this.seccionSeleccionada = seccion; // 👈 Corregido el typo "section"
    this.nivelActual = 3;
    const numeroAnio = this.salaSeleccionada.replace("Sala ", ""); // 👈 año cambiado a anio
    
    // Regla de Negocio: Secciones A y B en la Mañana, C en adelante Tarde
    const turno = (seccion === "A" || seccion === "B") ? "Turno Mañana" : "Turno Tarde";
    this.textoSubHeaderLista = `Año ${numeroAnio} - Sección ${seccion} (${turno})`; // 👈 Corregida concatenación nativa de strings

    this.alumnosSeccion = this.baseDatosAlumnos.filter(a => a.anio === numeroAnio && a.seccion === seccion);
  }

  // Navegación: Cargar expediente individual
  cargarFichaExpediente(alumno: any) {
    this.alumnoSeleccionado = alumno;
    this.nivelActual = 4; // Entramos al nivel de ficha
  }

  // Centralización para calcular estilos del turno en la Ficha Médica
  obtenerDatosTurno(seccion: string) {
    const esManana = seccion === 'A' || seccion === 'B';
    return {
      texto: esManana ? 'Turno Mañana' : 'Turno Tarde',
      color: esManana ? '#d97706' : '#16a34a',
      bg: esManana ? '#fef3c7' : '#f0fdf4',
      border: esManana ? '#d9770640' : '#16a34a40'
    };
  }

  // Control centralizado del botón "Volver"
  retrocederNivel() {
    if (this.nivelActual === 4) {
      this.nivelActual = this.modoBusquedaActivo ? 1 : 3;
      return;
    }

    if (this.modoBusquedaActivo) {
      this.terminoBusqueda = '';
      this.modoBusquedaActivo = false;
      return;
    }

    if (this.nivelActual === 3) {
      this.nivelActual = 2;
    } else if (this.nivelActual === 2) {
      this.nivelActual = 1;
    }
  }

  obtenerMatriculaActual(): any {
    if (!this.salaSeleccionada || !this.seccionSeleccionada) return null;
    const numeroAnio = this.salaSeleccionada.replace("Sala ", "");
    return this.matriculasList.find(m => 
      m.aula.includes(numeroAnio) && 
      m.seccion.toLowerCase().trim() === this.seccionSeleccionada.toLowerCase().trim()
    );
  }

  obtenerNombreDocente(ci: string): string {
    if (!ci) return 'No asignado';
    const p = this.personalList.find(emp => emp.ci_p === ci);
    return p ? p.nombre_p : ci;
  }

  obtenerSuplenteMatricula(matricula: any): string {
    if (!matricula || !matricula.motivo_m) return 'Ninguno';
    try {
      const motivo = JSON.parse(matricula.motivo_m);
      return motivo.suplenteNombre || motivo.suplenteCi || 'Ninguno';
    } catch {
      return 'Ninguno';
    }
  }

  obtenerTurnoDocenteMatricula(matricula: any): string {
    if (!matricula || !matricula.motivo_m) return 'Ninguno';
    try {
      const motivo = JSON.parse(matricula.motivo_m);
      return motivo.turnoNombre || motivo.turnoCi || 'Ninguno';
    } catch {
      return 'Ninguno';
    }
  }

  // ==========================================
  // ESTADÍSTICAS Y AGRUPACIONES
  // ==========================================

  get totalAlumnos(): number {
    return this.baseDatosAlumnos.length;
  }

  get totalRepresentantes(): number {
    const cis = new Set(this.baseDatosAlumnos.map(a => a.repreCedula).filter(Boolean));
    return cis.size;
  }

  contarAlumnosPorSala(salaId: string): number {
    return this.baseDatosAlumnos.filter(a => a.anio === salaId).length;
  }

  contarAlumnosPorSeccion(salaId: string, seccion: string): number {
    return this.baseDatosAlumnos.filter(a => a.anio === salaId && a.seccion === seccion).length;
  }

  obtenerCapacidadSeccion(salaId: string, seccion: string): number {
    const mat = this.matriculasList.find(m =>
      m.aula.includes(salaId) &&
      m.seccion.toLowerCase().trim() === seccion.toLowerCase().trim()
    );
    return mat ? mat.capacidad : 0;
  }

  get representantesConNinos(): any[] {
    const mapa: { [ci: string]: { nombre: string; cedula: string; ninos: string[] } } = {};
    for (const alumno of this.baseDatosAlumnos) {
      const ci = alumno.repreCedula;
      if (!ci) continue;
      if (!mapa[ci]) {
        mapa[ci] = { nombre: alumno.repre || 'Desconocido', cedula: ci, ninos: [] };
      }
      mapa[ci].ninos.push(alumno.nombre);
    }
    return Object.values(mapa).sort((a, b) => b.ninos.length - a.ninos.length);
  }

  // Vista de panel de representantes
  mostrarPanelRepresentantes: boolean = false;

  togglePanelRepresentantes() {
    this.mostrarPanelRepresentantes = !this.mostrarPanelRepresentantes;
  }
}