import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-alumnos-inscritos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alumnos-inscritos.html'
})
export class AlumnosInscritosComponent implements OnInit {
  listaCompleta: any[] = [];
  terminoBusqueda: string = '';
  modalAbierto: boolean = false;
  alumnoSeleccionado: any = {};
  familiasAgrupadas: { [key: string]: any[] } = {};
  modoEdicion: boolean = false;
  datosEdicion: any = {};
  mostrarDesertores: boolean = false;
  todosLosAlumnos: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.inicializarModulo();
  }

  async inicializarModulo() {
    this.terminoBusqueda = '';
    const token = localStorage.getItem("jba_token");
    if (!token) return;

    try {
      const [aluResp, inscResp, repResp, matResp] = await Promise.all([
        fetch("http://localhost:5188/api/alumnos", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://localhost:5188/api/inscripciones", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://localhost:5188/api/representantes", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://localhost:5188/api/matriculas", { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      if (!aluResp.ok || !inscResp.ok || !repResp.ok || !matResp.ok) {
        throw new Error("Error al obtener datos del servidor.");
      }

      const alumnos = await aluResp.json();
      const inscripciones = await inscResp.json();
      const representantes = await repResp.json();
      const matriculas = await matResp.json();

      this.todosLosAlumnos = alumnos;

      // Filtrar según mostrarDesertores
      const estadoFiltro = this.mostrarDesertores ? 0 : 1;
      const alumnosFiltrados = this.todosLosAlumnos.filter((a: any) => a.estado_alumno === estadoFiltro);

      this.listaCompleta = alumnosFiltrados.map((alumno: any) => {
        const rep = representantes.find((r: any) => r.ci_representante === alumno.ci_representante);
        
        // Buscar la inscripción más reciente para el aula
        const studentInscs = inscripciones.filter((i: any) => i.ci_alumno === alumno.ci_alumno);
        let insc = null;
        if (studentInscs.length > 0) {
          studentInscs.sort((a: any, b: any) => b.id_inscripcion - a.id_inscripcion);
          insc = studentInscs[0];
        }
        
        let sala = "Sin Aula Asignada";
        let seccion = "";
        if (insc) {
          const mat = matriculas.find((m: any) => m.id_aula === insc.id_aula);
          if (mat) {
            sala = mat.aula;
            seccion = mat.seccion;
          }
        }

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
          id: alumno.ci_alumno,
          cedulaAlumno: alumno.ci_alumno,
          nombre: alumno.nombre_alumno,
          sexo: alumno.sexo,
          fechaNac: alumno.fecha_registro_a ? alumno.fecha_registro_a.substring(0, 10) : "",
          edad: alumno.edad_alumno,
          sala: sala,
          seccion: seccion,
          representante: rep ? rep.nombre_representante : "N/A",
          cedula: alumno.ci_representante,
          repTelefono: repTelefono,
          historialMedico: alumno.cardiovascular || "Sin observaciones",
          ciMadre: rep ? rep.ci_madre : "",
          nombreMadre: rep ? rep.nombre_madre : "",
          telMadre: telMadre,
          ciPadre: rep ? rep.ci_padre : "",
          nombrePadre: rep ? rep.nombre_padre : "",
          telPadre: telPadre,
          fechaRegistro: alumno.fecha_registro_a ? new Date(alumno.fecha_registro_a).toLocaleDateString() : "",
          anoEntrada: alumno.fecha_registro_a ? new Date(alumno.fecha_registro_a).getFullYear() : 2026,
          motivo: alumno.motivo_a || "Nuevo Ingreso",
          estado: alumno.estado_alumno
        };
      });

      this.obtenerGrupos();
      this.cdr.detectChanges();

    } catch (e) {
      console.error("Error al inicializar el módulo de alumnos:", e);
    }
  }

  get alumnosFiltrados() {
    const filtro = this.terminoBusqueda.toLowerCase().trim();
    if (!filtro) return this.listaCompleta;
    return this.listaCompleta.filter(alumno => 
      alumno.nombre?.toLowerCase().includes(filtro) || 
      (alumno.cedulaAlumno && alumno.cedulaAlumno.includes(filtro))
    );
  }

  obtenerGrupos(): string[] {
    this.familiasAgrupadas = {};
    const alumnos = this.alumnosFiltrados;

    alumnos.forEach(alumno => {
      const letraSeccion = (alumno.seccion || 'A').toUpperCase();
      const turnoCalculado = (letraSeccion === 'A' || letraSeccion === 'B') ? 'Turno Mañana' : 'Turno Tarde';
      const nombreGrupo = `${alumno.sala || 'Sala de 3 Años'} - Sección ${letraSeccion} (${turnoCalculado})`;

      if (!this.familiasAgrupadas[nombreGrupo]) {
        this.familiasAgrupadas[nombreGrupo] = [];
      }
      this.familiasAgrupadas[nombreGrupo].push(alumno);
    });

    return Object.keys(this.familiasAgrupadas);
  }

  verFichaCompleta(alumno: any) {
    this.alumnoSeleccionado = alumno;
    this.modoEdicion = false;
    this.modalAbierto = true;
  }

  habilitarEdicion() {
    this.modoEdicion = true;
    this.datosEdicion = { ...this.alumnoSeleccionado };
  }

  async guardarCambiosEdicion() {
    const token = localStorage.getItem("jba_token");
    if (!token) return;

    try {
      // 1. Actualizar Alumno
      const edadActual = parseInt(this.datosEdicion.edad, 10);
      if (edadActual < 3 || edadActual > 6) {
         alert("La edad debe estar entre 3 y 6 años.");
         return;
      }
      const aluPayload = {
        ci_alumno: this.datosEdicion.cedulaAlumno,
        nombre_alumno: this.datosEdicion.nombre,
        sexo: this.datosEdicion.sexo,
        edad_alumno: edadActual,
        fecha_registro_a: this.alumnoSeleccionado.fechaNac || new Date().toISOString(), // Keep original
        cardiovascular: this.datosEdicion.historialMedico,
        ci_representante: this.datosEdicion.cedula,
        motivo_a: this.datosEdicion.motivo,
        estado_alumno: this.alumnoSeleccionado.estado !== undefined ? this.alumnoSeleccionado.estado : 1
      };
      
      const resAlu = await fetch(`http://localhost:5188/api/alumnos/${this.datosEdicion.cedulaAlumno}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(aluPayload)
      });
      if (!resAlu.ok) throw new Error("Error al actualizar alumno");

      // 2. Actualizar o Crear Representante (en caso de que hayan cambiado la cédula)
      const motivoRep = JSON.stringify({
         repTelefono: this.datosEdicion.repTelefono,
         telMadre: this.datosEdicion.telMadre,
         telPadre: this.datosEdicion.telPadre
      });
      const repPayload = {
        ci_representante: this.datosEdicion.cedula,
        nombre_representante: this.datosEdicion.representante,
        ci_madre: this.datosEdicion.ciMadre,
        nombre_madre: this.datosEdicion.nombreMadre,
        ci_padre: this.datosEdicion.ciPadre,
        nombre_padre: this.datosEdicion.nombrePadre,
        motivo_r: motivoRep,
        estado_representante: 1,
        hijos: 1,
        fecha_registro: new Date().toISOString()
      };

      // Intentamos crearlo primero (por si es una cédula nueva)
      const repPostResp = await fetch("http://localhost:5188/api/representantes", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(repPayload)
      });
      
      // Si ya existe (BadRequest o Conflict), usamos PUT para actualizarlo
      if (!repPostResp.ok) {
        const errText = await repPostResp.text();
        if (errText.includes("ya existe") || errText.includes("Ya existe")) {
           const repPutResp = await fetch(`http://localhost:5188/api/representantes/${this.datosEdicion.cedula}`, {
             method: "PUT",
             headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
             body: JSON.stringify(repPayload)
           });
           if (!repPutResp.ok) throw new Error("Error al actualizar representante existente");
        } else {
           console.warn("Advertencia al guardar representante:", errText);
        }
      }

      alert("Datos actualizados correctamente.");
      this.modoEdicion = false;
      this.modalAbierto = false;
      await this.inicializarModulo();
    } catch (e) {
      console.error(e);
      alert("Ocurrió un error al guardar los cambios.");
    }
  }

  cancelarEdicion() {
    this.modoEdicion = false;
  }

  async retirarAlumno(alumno: any) {
    const confirmar = confirm(`⚠️ ¿Seguro que deseas retirar a "${alumno.nombre}" del sistema?\nEl estudiante será marcado como Inactivo (Desertor).`);
    if (confirmar) {
      const token = localStorage.getItem("jba_token");
      if (!token) return;

      try {
        const aluPayload = {
          ci_alumno: alumno.cedulaAlumno,
          nombre_alumno: alumno.nombre,
          sexo: alumno.sexo,
          edad_alumno: alumno.edad,
          fecha_registro_a: alumno.fechaNac || new Date().toISOString(),
          cardiovascular: alumno.historialMedico,
          ci_representante: alumno.cedula,
          motivo_a: "Desertor",
          estado_alumno: 0 // Inactivo
        };

        const response = await fetch(`http://localhost:5188/api/alumnos/${alumno.cedulaAlumno}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(aluPayload)
        });

        if (response.ok) {
          alert("¡Estudiante retirado y marcado como inactivo exitosamente!");
          await this.inicializarModulo();
          this.cdr.detectChanges();
        } else {
          const errMsg = await response.text();
          alert(`Error al retirar estudiante: ${errMsg}`);
        }
      } catch (error) {
        console.error("Error al retirar alumno:", error);
        alert("No se pudo conectar con el servidor para retirar al alumno.");
      }
    }
  }

  setMostrarDesertores(val: boolean) {
    this.mostrarDesertores = val;
    this.inicializarModulo();
  }

  obtenerContadorActivos(): number {
    return this.todosLosAlumnos.filter((a: any) => a.estado_alumno === 1).length;
  }

  obtenerContadorDesertores(): number {
    return this.todosLosAlumnos.filter((a: any) => a.estado_alumno === 0).length;
  }

  async activarAlumno(alumno: any) {
    const confirmar = confirm(`⚠️ ¿Seguro que deseas reincorporar a "${alumno.nombre}" al sistema?\nEl estudiante será marcado como Activo.`);
    if (confirmar) {
      const token = localStorage.getItem("jba_token");
      if (!token) return;

      try {
        const aluPayload = {
          ci_alumno: alumno.cedulaAlumno,
          nombre_alumno: alumno.nombre,
          sexo: alumno.sexo,
          edad_alumno: alumno.edad,
          fecha_registro_a: alumno.fechaNac || new Date().toISOString(),
          cardiovascular: alumno.historialMedico,
          ci_representante: alumno.cedula,
          motivo_a: "Reincorporado",
          estado_alumno: 1 // Activo
        };

        const response = await fetch(`http://localhost:5188/api/alumnos/${alumno.cedulaAlumno}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(aluPayload)
        });

        if (response.ok) {
          alert("¡Estudiante reincorporado exitosamente!");
          await this.inicializarModulo();
          this.cdr.detectChanges();
        } else {
          const errMsg = await response.text();
          alert(`Error al reincorporar estudiante: ${errMsg}`);
        }
      } catch (error) {
        console.error("Error al reincorporar alumno:", error);
        alert("No se pudo conectar con el servidor para reincorporar al alumno.");
      }
    }
  }



  cerrarModalFondo(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-ficha-fondo')) {
      this.modalAbierto = false;
    }
  }

  exportarAlumnosExcel() {
    if (this.listaCompleta.length === 0) {
      alert("No hay alumnos matriculados para exportar.");
      return;
    }

    // Calcular estadísticas
    const total = this.listaCompleta.length;
    const varones = this.listaCompleta.filter(a => a.sexo === 'Masculino' || a.sexo === 'M').length;
    const hembras = this.listaCompleta.filter(a => a.sexo === 'Femenino' || a.sexo === 'F').length;
    
    const pctVarones = ((varones / total) * 100).toFixed(1);
    const pctHembras = ((hembras / total) * 100).toFixed(1);

    const sala3 = this.listaCompleta.filter(a => a.sala.includes('3')).length;
    const sala4 = this.listaCompleta.filter(a => a.sala.includes('4')).length;
    const sala5 = this.listaCompleta.filter(a => a.sala.includes('5')).length;

    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
    html += `<head><meta charset="utf-8">`;
    html += `<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Matrículas</x:Name>`;
    html += `<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->`;
    html += `<style>`;
    html += `table { border-collapse: collapse; font-family: Segoe UI, sans-serif; }`;
    html += `th { background-color: #1e3a8a; color: white; font-weight: bold; border: 1px solid #cbd5e1; padding: 10px; text-align: center; }`;
    html += `td { border: 1px solid #cbd5e1; padding: 8px; text-align: center; }`;
    html += `.header-title { font-size: 16px; font-weight: bold; color: #1e3a8a; text-align: center; padding: 15px; }`;
    html += `.stat-label { background-color: #f8fafc; font-weight: bold; text-align: left; }`;
    html += `.stat-value { font-weight: bold; text-align: right; color: #1e3a8a; }`;
    html += `.grupo-header { background-color: #eff6ff; font-weight: bold; text-align: left; color: #1d4ed8; padding: 8px; }`;
    html += `</style></head><body>`;

    html += `<table>`;
    html += `<tr><td colspan="7" class="header-title">REPORTE GENERAL DE MATRÍCULAS E INSCRIPCIONES - JBA</td></tr>`;
    
    // Cuadro estadístico resumido
    html += `<tr><td colspan="7" class="grupo-header">📊 RESUMEN ESTADÍSTICO DEL PLANTEL</td></tr>`;
    html += `<tr><td colspan="4" class="stat-label">TOTAL MATRÍCULA ESCOLAR:</td><td colspan="3" class="stat-value">${total} alumnos</td></tr>`;
    html += `<tr><td colspan="4" class="stat-label">👦 VARONES (MASCULINO):</td><td colspan="3" class="stat-value">${varones} (${pctVarones}%)</td></tr>`;
    html += `<tr><td colspan="4" class="stat-label">👧 HEMBRAS (FEMENINO):</td><td colspan="3" class="stat-value">${hembras} (${pctHembras}%)</td></tr>`;
    html += `<tr><td colspan="4" class="stat-label">👶 SALA DE 3 AÑOS:</td><td colspan="3" class="stat-value">${sala3} alumnos</td></tr>`;
    html += `<tr><td colspan="4" class="stat-label">👶 SALA DE 4 AÑOS:</td><td colspan="3" class="stat-value">${sala4} alumnos</td></tr>`;
    html += `<tr><td colspan="4" class="stat-label">👶 SALA DE 5 AÑOS:</td><td colspan="3" class="stat-value">${sala5} alumnos</td></tr>`;
    html += `<tr><td colspan="7"></td></tr>`;

    // Tabla de alumnos inscritos
    html += `<tr><td colspan="7" class="grupo-header">📝 LISTADO DETALLADO DE ESTUDIANTES</td></tr>`;
    html += `<tr>`;
    html += `<th>CÉDULA ESCOLAR</th>`;
    html += `<th>ALUMNO</th>`;
    html += `<th>EDAD</th>`;
    html += `<th>GÉNERO</th>`;
    html += `<th>AULA/SECCIÓN</th>`;
    html += `<th>REPRESENTANTE</th>`;
    html += `<th>TELÉFONO</th>`;
    html += `</tr>`;

    // Agrupar por aula/sección
    const grupos = this.obtenerGrupos();
    grupos.forEach(grupo => {
      html += `<tr><td colspan="7" style="text-align: left; font-weight: bold; background-color: #f1f5f9; color: #334155; padding: 6px;">📂 ${grupo}</td></tr>`;
      this.familiasAgrupadas[grupo].forEach(alumno => {
        html += `<tr>`;
        html += `<td>${alumno.cedulaAlumno}</td>`;
        html += `<td style="text-align: left;">${alumno.nombre}</td>`;
        html += `<td>${alumno.edad}</td>`;
        html += `<td>${alumno.sexo}</td>`;
        html += `<td>${alumno.sala} - Secc ${alumno.seccion || 'A'}</td>`;
        html += `<td style="text-align: left;">${alumno.representante}</td>`;
        html += `<td>${alumno.repTelefono}</td>`;
        html += `</tr>`;
      });
    });

    html += `</table></body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Reporte_Matriculas_Estudiantes_${new Date().toISOString().substring(0,10)}.xls`);
    a.click();
    window.URL.revokeObjectURL(url);
  }
}