import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inscripcion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inscripcion.html',
  styleUrls: ['./inscripcion.css']
})
export class InscripcionComponent implements OnInit {
  pestanaActual: number = 1;
  esRegular: string = 'no';
  terminoBusqueda: string = '';
  turnoTexto: string = '';
  alumnoEncontradoID: number | null = null;
  representanteAutoRellenado: boolean = false;
  private debounceTimer: any = null;
  matriculas: any[] = [];

  alumno: any = {
    id: null,
    cedulaAlumno: '',
    prefijoCedula: '1',
    nombre: '',
    sexo: '',
    fechaNac: '',
    edad: null,
    sala: '',
    salaNumero: '3',
    seccion: '',
    representante: '',
    cedula: '',
    repTelefono: '',
    historialMedico: '',
    ciMadre: '',
    nombreMadre: '',
    telMadre: '',
    ciPadre: '',
    nombrePadre: '',
    telPadre: '',
    anoEntrada: 2026,
    motivo: ''
  };

  requisitos: any = { partida: false, fotos: false, cedulaRep: false, vacunas: false };
  seccionesDisponibles: any[] = [];

  mapaSalas: any = {
    "3": [{ sec: "A", turno: "Mañana" }, { sec: "B", turno: "Mañana" }, { sec: "C", turno: "Tarde" }],
    "4": [{ sec: "A", turno: "Mañana" }, { sec: "B", turno: "Mañana" }, { sec: "C", turno: "Tarde" }, { sec: "D", turno: "Tarde" }],
    "5": [{ sec: "A", turno: "Mañana" }, { sec: "B", turno: "Mañana" }, { sec: "C", turno: "Tarde" }, { sec: "D", turno: "Tarde" }, { sec: "E", turno: "Tarde" }]
  };

  representantesList: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.procesarEdadYAsignarSala();
    this.cargarMatriculas();
    this.cargarRepresentantes();
  }

  async cargarRepresentantes() {
    const token = localStorage.getItem("jba_token");
    try {
      const response = await fetch("http://localhost:5188/api/representantes", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        this.representantesList = await response.json();
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error("Error al cargar representantes:", error);
    }
  }

  async cargarMatriculas() {
    const token = localStorage.getItem("jba_token");
    try {
      const response = await fetch("http://localhost:5188/api/matriculas", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        this.matriculas = await response.json();
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error("Error al cargar matriculas desde la API:", error);
    }
  }

  calcularCedulaEscolar() {
    if (this.alumno.cedula && this.alumno.fechaNac) {
      const anoCorto = this.alumno.fechaNac.substring(2, 4);
      const cedulaLimpia = this.alumno.cedula.replace(/\D/g, '');
      const prefijo = this.alumno.prefijoCedula || '';
      this.alumno.cedulaAlumno = `${prefijo}${anoCorto}${cedulaLimpia}`;
    } else {
      this.alumno.cedulaAlumno = '';
    }

    if (this.alumno.fechaNac) {
      this.procesarEdadYAsignarSala();
    }

    // Buscar representante con debounce (espera 600ms después de que el usuario deje de teclear)
    this.representanteAutoRellenado = false;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.buscarYAutofillarRepresentante();
      this.cdr.detectChanges();
    }, 600);
  }

  buscarYAutofillarRepresentante() {
    const cedula = this.alumno.cedula ? this.alumno.cedula.trim() : "";
    if (!cedula || cedula.length < 6) {
      this.representanteAutoRellenado = false;
      return;
    }
    const rep = this.representantesList.find(r => r.ci_representante === cedula);
    if (rep) {
      // Solo rellenar campos que estén vacíos para no borrar lo que el usuario ya escribió
      if (!this.alumno.representante) this.alumno.representante = rep.nombre_representante || "";
      
      let telRep = "";
      let telMad = "";
      let telPad = "";
      if (rep.motivo_r) {
        try {
          const contacto = JSON.parse(rep.motivo_r);
          telRep = contacto.repTelefono || "";
          telMad = contacto.telMadre || "";
          telPad = contacto.telPadre || "";
        } catch (e) {
          // No era JSON
        }
      }
      
      if (!this.alumno.repTelefono) this.alumno.repTelefono = telRep;
      if (!this.alumno.ciMadre) this.alumno.ciMadre = rep.ci_madre || "";
      if (!this.alumno.nombreMadre) this.alumno.nombreMadre = rep.nombre_madre || "";
      if (!this.alumno.telMadre) this.alumno.telMadre = telMad;
      if (!this.alumno.ciPadre) this.alumno.ciPadre = rep.ci_padre || "";
      if (!this.alumno.nombrePadre) this.alumno.nombrePadre = rep.nombre_padre || "";
      if (!this.alumno.telPadre) this.alumno.telPadre = telPad;

      this.representanteAutoRellenado = true;
    } else {
      this.representanteAutoRellenado = false;
    }
  }

  buscarYAutofillarMadre() {
    const ci = this.alumno.ciMadre ? this.alumno.ciMadre.trim() : "";
    if (!ci) return;
    const rep = this.representantesList.find(r => r.ci_madre === ci || r.ci_representante === ci);
    if (rep) {
      this.alumno.nombreMadre = rep.ci_madre === ci ? rep.nombre_madre : rep.nombre_representante;
      if (rep.motivo_r) {
        try {
          const contacto = JSON.parse(rep.motivo_r);
          this.alumno.telMadre = rep.ci_madre === ci ? (contacto.telMadre || "") : (contacto.repTelefono || "");
        } catch (e) {}
      }
    }
  }

  buscarYAutofillarPadre() {
    const ci = this.alumno.ciPadre ? this.alumno.ciPadre.trim() : "";
    if (!ci) return;
    const rep = this.representantesList.find(r => r.ci_padre === ci || r.ci_representante === ci);
    if (rep) {
      this.alumno.nombrePadre = rep.ci_padre === ci ? rep.nombre_padre : rep.nombre_representante;
      if (rep.motivo_r) {
        try {
          const contacto = JSON.parse(rep.motivo_r);
          this.alumno.telPadre = rep.ci_padre === ci ? (contacto.telPadre || "") : (contacto.repTelefono || "");
        } catch (e) {}
      }
    }
  }

  procesarEdadYAsignarSala() {
    if (!this.alumno.fechaNac) {
      this.seccionesDisponibles = this.mapaSalas["3"];
      return;
    }
    const fechaNac = new Date(this.alumno.fechaNac);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) edad--;

    this.alumno.edad = edad;
    if (edad < 3 || edad > 5) {
      this.alumno.sala = "Edad no permitida (Rango: 3 a 5 años)";
      this.seccionesDisponibles = [];
      this.alumno.seccion = "";
      this.turnoTexto = "";
      return;
    }

    if (edad === 4) this.alumno.salaNumero = "4";
    else if (edad >= 5) this.alumno.salaNumero = "5";
    else this.alumno.salaNumero = "3";

    this.alumno.sala = `Sala de ${this.alumno.salaNumero} Años`;
    this.seccionesDisponibles = this.mapaSalas[this.alumno.salaNumero];
  }

  actualizarTurnoVisual() {
    const seleccionada = this.seccionesDisponibles.find(s => s.sec === this.alumno.seccion);
    if (seleccionada) {
      this.turnoTexto = seleccionada.turno === 'Mañana' 
        ? '☀️ Asignación confirmada en el Turno de la Mañana.' 
        : '🌙 Asignación confirmada en el Turno de la Tarde.';
    }
  }

  alternarTipoIngreso() {
    this.resetearRequisitos();
    if (this.esRegular === 'si') {
      this.requisitos.partida = true;
      this.requisitos.cedulaRep = true;
    } else {
      this.resetearFormulario();
    }
  }

  resetearRequisitos() {
    this.requisitos = { partida: false, fotos: false, cedulaRep: false, vacunas: false };
  }

  cambiarPestana(direccion: number) {
    if (direccion === 1 && this.pestanaActual === 1) {
      if (!this.alumno.nombre || !this.alumno.fechaNac || !this.alumno.cedula || !this.alumno.representante || !this.alumno.historialMedico || !this.alumno.sexo) {
        alert(`Por favor llene los campos obligatorios (*) y seleccione el sexo.\nCampos vacíos detectados.`);
        return;
      }
      if (this.alumno.edad < 3 || this.alumno.edad > 5) {
        alert("El estudiante no cumple con el rango de edad permitido para el preescolar (entre 3 y 5 años).");
        return;
      }
    }
    if (direccion === 1 && this.pestanaActual === 3) {
      if (this.alumno.edad < 3 || this.alumno.edad > 5) {
        alert("El estudiante debe tener entre 3 y 5 años de edad para poder continuar.");
        return;
      }
      if (!this.alumno.seccion) {
        alert("Debe seleccionar una sección.");
        return;
      }
    }
    this.pestanaActual += direccion;
  }

  async buscarAlumnoRegular() {
    if (!this.terminoBusqueda) return;
    const token = localStorage.getItem("jba_token");
    if (!token) {
      alert("No has iniciado sesión o tu sesión ha expirado.");
      return;
    }

    try {
      const aluResp = await fetch("http://localhost:5188/api/alumnos", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!aluResp.ok) throw new Error("Error al obtener alumnos.");
      const alumnos: any[] = await aluResp.json();

      const query = this.terminoBusqueda.toLowerCase().trim();
      const alumnoEncontrado = alumnos.find(a => 
        a.nombre_alumno.toLowerCase().includes(query) || 
        a.ci_alumno.includes(query)
      );

      if (!alumnoEncontrado) {
        alert("❌ No se encontró el estudiante en la base de datos.");
        return;
      }

      const repResp = await fetch(`http://localhost:5188/api/representantes`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!repResp.ok) throw new Error("Error al obtener representantes.");
      const representantes: any[] = await repResp.json();

      const repEncontrado = representantes.find(r => r.ci_representante === alumnoEncontrado.ci_representante);

      let repTelefono = "";
      let telMadre = "";
      let telPadre = "";
      if (repEncontrado && repEncontrado.motivo_r) {
        try {
          const contacto = JSON.parse(repEncontrado.motivo_r);
          repTelefono = contacto.repTelefono || "";
          telMadre = contacto.telMadre || "";
          telPadre = contacto.telPadre || "";
        } catch (e) {
          // No era JSON
        }
      }

      const inscResp = await fetch("http://localhost:5188/api/inscripciones", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      let sala = "";
      let seccion = "";
      let ultimoAnoInscripcion = new Date().getFullYear() - 1;
      if (inscResp.ok) {
        const inscripciones: any[] = await inscResp.json();
        const studentInscs = inscripciones.filter(i => i.ci_alumno === alumnoEncontrado.ci_alumno);
        let insc = null;
        if (studentInscs.length > 0) {
          studentInscs.sort((a: any, b: any) => b.id_inscripcion - a.id_inscripcion);
          insc = studentInscs[0];
        }
        if (insc) {
          const mat = this.matriculas.find(m => m.id_aula === insc.id_aula);
          if (mat) {
            sala = mat.aula;
            seccion = mat.seccion;
          }
          if (insc.fecha_inscripcion) {
            ultimoAnoInscripcion = new Date(insc.fecha_inscripcion).getFullYear();
          }
        }
      }

      const siguienteAno = ultimoAnoInscripcion + 1;

      // Para el estudiante regular, recalculamos su edad incrementándola en 1 año para el nuevo período
      const nuevaEdad = (alumnoEncontrado.edad_alumno || 3) + 1;
      let fakeFechaNac = "";
      const fakeDate = new Date();
      fakeDate.setFullYear(fakeDate.getFullYear() - nuevaEdad);
      fakeFechaNac = fakeDate.toISOString().substring(0, 10);

      const ciAlumno = alumnoEncontrado.ci_alumno || '';
      const ciRep = alumnoEncontrado.ci_representante ? alumnoEncontrado.ci_representante.replace(/\D/g, '') : '';
      let prefijo = '1';
      if (ciAlumno && ciRep) {
        const suffixIndex = ciAlumno.indexOf(ciRep);
        if (suffixIndex > 2) {
          prefijo = ciAlumno.substring(0, suffixIndex - 2);
        }
      }

      this.alumno = {
        id: alumnoEncontrado.ci_alumno,
        cedulaAlumno: alumnoEncontrado.ci_alumno,
        prefijoCedula: prefijo,
        nombre: alumnoEncontrado.nombre_alumno,
        sexo: alumnoEncontrado.sexo,
        fechaNac: fakeFechaNac,
        edad: nuevaEdad,
        sala: sala,
        seccion: seccion,
        representante: repEncontrado ? repEncontrado.nombre_representante : "",
        cedula: alumnoEncontrado.ci_representante,
        repTelefono: repTelefono,
        historialMedico: alumnoEncontrado.cardiovascular || 'Sano',
        ciMadre: repEncontrado ? repEncontrado.ci_madre : "",
        nombreMadre: repEncontrado ? repEncontrado.nombre_madre : "",
        telMadre: telMadre,
        ciPadre: repEncontrado ? repEncontrado.ci_padre : "",
        nombrePadre: repEncontrado ? repEncontrado.nombre_padre : "",
        telPadre: telPadre,
        anoEntrada: siguienteAno,
        motivo: alumnoEncontrado.motivo_a
      };

      this.alumnoEncontradoID = 1;
      this.procesarEdadYAsignarSala();
      this.cdr.detectChanges();
      alert(`🎉 Historial del alumno "${alumnoEncontrado.nombre_alumno}" cargado desde la base de datos.`);

    } catch (error) {
      console.error("Error al buscar alumno regular:", error);
      alert("❌ Error al conectar con la base de datos para buscar al estudiante.");
    }
  }

  async getErrorMessage(response: Response): Promise<string> {
    try {
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        if (json.errors) {
          return Object.values(json.errors).flat().join(", ");
        }
        return json.mensaje || json.title || text || `Error ${response.status}`;
      } catch {
        return text || `Error ${response.status}`;
      }
    } catch {
      return `Error ${response.status}`;
    }
  }

  async guardarMatricula() {
    const token = localStorage.getItem("jba_token");
    if (!token) {
      alert("No has iniciado sesión o tu sesión ha expirado.");
      return;
    }

    if (this.alumno.edad < 3 || this.alumno.edad > 5) {
      alert("No se puede guardar la matrícula: el estudiante está fuera de la edad permitida (3 a 5 años).");
      return;
    }

    const aulaNombre = this.alumno.sala;
    const seccionNombre = this.alumno.seccion;

    if (!this.matriculas || this.matriculas.length === 0) {
      await this.cargarMatriculas();
    }

    const matriculaEncontrada = this.matriculas.find(m => 
      m.aula.toLowerCase().trim() === aulaNombre.toLowerCase().trim() && 
      m.seccion.toLowerCase().trim() === seccionNombre.toLowerCase().trim()
    );

    if (!matriculaEncontrada) {
      alert(`No se encontró un aula/sección coincidente en el sistema para: ${aulaNombre} - Sección ${seccionNombre}.`);
      return;
    }

    const idAula = matriculaEncontrada.id_aula;

    const prepContacto = {
      repTelefono: this.alumno.repTelefono || "",
      telMadre: this.alumno.telMadre || "",
      telPadre: this.alumno.telPadre || ""
    };

    const representantePayload = {
      ci_representante: this.alumno.cedula,
      ci_padre: this.alumno.ciPadre || null,
      ci_madre: this.alumno.ciMadre || null,
      nombre_representante: this.alumno.representante,
      nombre_padre: this.alumno.nombrePadre || null,
      nombre_madre: this.alumno.nombreMadre || null,
      foto_padre: null,
      foto_madre: null,
      fecha_registro: new Date().toISOString(),
      fecha_salida: null,
      estado_representante: 1,
      motivo_r: JSON.stringify(prepContacto),
      hijos: 1,
      carta_residencia: this.requisitos.cedulaRep ? "Entregado" : "Pendiente"
    };

    const alumnoPayload = {
      ci_alumno: this.alumno.cedulaAlumno,
      nombre_alumno: this.alumno.nombre,
      estado_alumno: 1,
      motivo_a: this.alumno.motivo || (this.esRegular === 'si' ? 'Regular' : 'Nuevo Ingreso'),
      fecha_registro_a: new Date().toISOString(),
      fecha_salida_a: null,
      ci_representante: this.alumno.cedula,
      edad_alumno: this.alumno.edad,
      foto_a: null,
      partida_nacimiento: this.requisitos.partida ? "Entregado" : "Pendiente",
      sexo: this.alumno.sexo,
      cardiovascular: this.alumno.historialMedico
    };

    const inscripcionPayload = {
      id_aula: idAula,
      ci_alumno: this.alumno.cedulaAlumno,
      fecha_inscripcion: new Date().toISOString()
    };

    try {
      // REPRESENTANTE
      const repMetodo = this.esRegular === 'si' ? "PUT" : "POST";
      const repUrl = this.esRegular === 'si' ? `http://localhost:5188/api/representantes/${this.alumno.cedula}` : "http://localhost:5188/api/representantes";
      const repResp = await fetch(repUrl, {
        method: repMetodo,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(representantePayload)
      });

      if (!repResp.ok && repMetodo === "POST") {
        const errText = await this.getErrorMessage(repResp);
        if (!errText.includes("ya existe") && !errText.includes("Ya existe")) {
          // Attempt PUT fallback if POST fails because it already exists
          const repRespPut = await fetch(`http://localhost:5188/api/representantes/${this.alumno.cedula}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(representantePayload)
          });
          if (!repRespPut.ok) console.warn("Advertencia al actualizar representante:", await this.getErrorMessage(repRespPut));
        }
      }

      // ALUMNO
      const aluMetodo = this.esRegular === 'si' ? "PUT" : "POST";
      const aluUrl = this.esRegular === 'si' ? `http://localhost:5188/api/alumnos/${this.alumno.cedulaAlumno}` : "http://localhost:5188/api/alumnos";
      const aluResp = await fetch(aluUrl, {
        method: aluMetodo,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(alumnoPayload)
      });

      if (!aluResp.ok) {
        const errText = await this.getErrorMessage(aluResp);
        throw new Error(`Error al ${this.esRegular === 'si' ? 'actualizar' : 'registrar'} alumno: ${errText}`);
      }

      // INSCRIPCION
      const inscResp = await fetch("http://localhost:5188/api/inscripciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(inscripcionPayload)
      });

      if (!inscResp.ok) {
        const errText = await this.getErrorMessage(inscResp);
        throw new Error(`Error al registrar inscripción: ${errText}`);
      }

      alert("💾 ¡Matrícula e inscripción procesadas con éxito en la Base de Datos!");
      this.resetearFormulario();
      this.cdr.detectChanges();

    } catch (error: any) {
      console.error("Error al guardar matrícula en la API:", error);
      alert(`❌ Error al guardar matrícula: ${error.message || error}`);
    }
  }

  resetearFormulario() {
    this.alumno = { id: null, cedulaAlumno: '', prefijoCedula: '1', nombre: '', sexo: '', fechaNac: '', edad: null, sala: '', salaNumero: '3', seccion: '', representante: '', cedula: '', repTelefono: '', historialMedico: '', ciMadre: '', nombreMadre: '', telMadre: '', ciPadre: '', nombrePadre: '', telPadre: '', anoEntrada: 2026, motivo: '' };
    this.alumnoEncontradoID = null;
    this.representanteAutoRellenado = false;
    this.pestanaActual = 1;
    this.esRegular = 'no';
    this.turnoTexto = '';
    this.resetearRequisitos();
  }

  descargarPDF() {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert("Por favor, permita las ventanas emergentes (popups) para poder imprimir la planilla.");
      return;
    }

    const fechaNacFormatted = this.alumno.fechaNac ? new Date(this.alumno.fechaNac).toLocaleDateString() : 'N/A';
    const hoyFormatted = new Date().toLocaleDateString();

    const partidaTxt = this.requisitos.partida ? '✅ Entregado' : '❌ Pendiente';
    const fotosTxt = this.requisitos.fotos ? '✅ Entregado' : '❌ Pendiente';
    const cedulaRepTxt = this.requisitos.cedulaRep ? '✅ Entregado' : '❌ Pendiente';
    const vacunasTxt = this.requisitos.vacunas ? '✅ Entregado' : '❌ Pendiente';

    let html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Planilla de Inscripción - ${this.alumno.nombre || 'Estudiante'}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333;
      line-height: 1.4;
      margin: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 3px double #333;
      padding-bottom: 10px;
    }
    .header h1 {
      font-size: 18px;
      margin: 0 0 5px 0;
      text-transform: uppercase;
    }
    .header h2 {
      font-size: 14px;
      margin: 0 0 5px 0;
      color: #555;
    }
    .header p {
      margin: 0;
      font-size: 11px;
    }
    .section-title {
      background-color: #f2f2f2;
      font-size: 12px;
      font-weight: bold;
      padding: 5px 10px;
      margin: 15px 0 8px 0;
      border: 1px solid #ccc;
      text-transform: uppercase;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    td {
      padding: 6px 8px;
      font-size: 11px;
      border: 1px solid #ccc;
      vertical-align: top;
    }
    .label {
      font-weight: bold;
      background-color: #fafafa;
      width: 25%;
    }
    .value {
      width: 25%;
    }
    .full-width {
      width: 75%;
    }
    .med-box {
      border: 1px solid #f5c2c2;
      background-color: #fcf2f2;
      color: #a94442;
      padding: 8px;
      font-size: 11px;
      border-radius: 4px;
    }
    .checklist td {
      width: 50%;
    }
    .signatures {
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
    }
    .sig-block {
      text-align: center;
      width: 45%;
    }
    .sig-line {
      border-top: 1px solid #000;
      margin-top: 50px;
      padding-top: 5px;
      font-size: 11px;
      font-weight: bold;
    }
    @media print {
      body { margin: 10px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom:20px; text-align:right;">
    <button onclick="window.print()" style="padding:10px 20px; background-color:#2b7bc7; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">🖨️ Imprimir Planilla</button>
    <button onclick="window.close()" style="padding:10px 20px; background-color:#64748b; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer; margin-left:10px;">Cerrar Ventana</button>
  </div>

  <div class="header">
    <h1>República Bolivariana de Venezuela</h1>
    <h2>Preescolar Juan Bautista Arismendi</h2>
    <p><strong>${this.esRegular === 'si' ? 'PLANILLA DE REINSCRIPCIÓN ESCOLAR - PERÍODO ESCOLAR' : 'PLANILLA DE INSCRIPCIÓN ESCOLAR - AÑO ELECTIVO'} ${this.alumno.anoEntrada || 2026} - ${ (this.alumno.anoEntrada || 2026) + 1 }</strong></p>
    <p style="font-size: 10px; margin-top: 5px;">Fecha de Impresión: ${hoyFormatted}</p>
  </div>

  <div class="section-title">1. Datos de Identificación del Estudiante</div>
  <table>
    <tr>
      <td class="label">Nombres y Apellidos:</td>
      <td class="value" colspan="3"><strong>${this.alumno.nombre || 'N/A'}</strong></td>
    </tr>
    <tr>
      <td class="label">Cédula Escolar:</td>
      <td class="value"><strong>${this.alumno.cedulaAlumno || 'N/A'}</strong></td>
      <td class="label">Género/Sexo:</td>
      <td class="value">${this.alumno.sexo || 'N/A'}</td>
    </tr>
    <tr>
      <td class="label">Fecha de Nacimiento:</td>
      <td class="value">${fechaNacFormatted}</td>
      <td class="label">Edad Asignada:</td>
      <td class="value">${this.alumno.edad || 'N/A'} años</td>
    </tr>
    <tr>
      <td class="label">Sala Asignada:</td>
      <td class="value" colspan="3"><strong>${this.alumno.sala || 'N/A'} - Sección "${this.alumno.seccion || 'N/A'}"</strong></td>
    </tr>
    <tr>
      <td class="label">Tipo de Ingreso:</td>
      <td class="value" colspan="3">${this.esRegular === 'si' ? 'Estudiante Regular (Reingreso)' : 'Nuevo Ingreso'} (${this.alumno.motivo || 'Sin observaciones'})</td>
    </tr>
  </table>

  <div class="section-title">2. Datos de los Representantes</div>
  <table>
    <tr>
      <td class="label">Representante Principal:</td>
      <td class="value" colspan="3"><strong>${this.alumno.representante || 'N/A'}</strong></td>
    </tr>
    <tr>
      <td class="label">Cédula del Representante:</td>
      <td class="value">${this.alumno.cedula || 'N/A'}</td>
      <td class="label">Teléfono Representante:</td>
      <td class="value">${this.alumno.repTelefono || 'N/A'}</td>
    </tr>
    <tr>
      <td class="label">Nombre de la Madre:</td>
      <td class="value">${this.alumno.nombreMadre || 'No Registrado'}</td>
      <td class="label">Cédula / Teléfono Madre:</td>
      <td class="value">${this.alumno.ciMadre ? 'V-' + this.alumno.ciMadre : 'N/A'} / ${this.alumno.telMadre || 'N/A'}</td>
    </tr>
    <tr>
      <td class="label">Nombre del Padre:</td>
      <td class="value">${this.alumno.nombrePadre || 'No Registrado'}</td>
      <td class="label">Cédula / Teléfono Padre:</td>
      <td class="value">${this.alumno.ciPadre ? 'V-' + this.alumno.ciPadre : 'N/A'} / ${this.alumno.telPadre || 'N/A'}</td>
    </tr>
  </table>

  <div class="section-title">3. Ficha Médica y Condiciones Especiales</div>
  <div class="med-box">
    <strong>SITUACIÓN DE SALUD / CARDIOVASCULAR:</strong><br>
    ${this.alumno.historialMedico || 'El representante declara que el estudiante se encuentra sano y apto para realizar actividades escolares regulares sin restricciones.'}
  </div>

  <div class="section-title">4. Requisitos Entregados en Secretaría</div>
  <table class="checklist">
    <tr>
      <td>Partida de Nacimiento Original y Copia: <strong>${partidaTxt}</strong></td>
      <td>Copia de Cédula de Identidad del Representante: <strong>${cedulaRepTxt}</strong></td>
    </tr>
    <tr>
      <td>Cuatro (4) Fotos Tipo Carnet del Estudiante: <strong>${fotosTxt}</strong></td>
      <td>Copia de Tarjeta de Vacunación al Día: <strong>${vacunasTxt}</strong></td>
    </tr>
  </table>

  <div class="section-title">5. Declaración Jurada y Compromiso</div>
  <p style="font-size: 10px; text-align: justify; margin: 5px 0;">
    Yo, <strong>${this.alumno.representante || '____________________'}</strong>, en mi condición de representante legal del estudiante inscrito, declaro bajo juramento que toda la información provista en esta planilla es fidedigna. Asimismo, me comprometo a cumplir y hacer cumplir las normativas internas del preescolar Juan Bautista Arismendi, apoyando las actividades pedagógicas y velando por el bienestar y asistencia diaria de mi representado.
  </p>

  <div class="signatures">
    <div class="sig-block">
      <div class="sig-line">
        Firma del Representante Legal<br>
        C.I. V-${this.alumno.cedula || ''}
      </div>
    </div>
    <div class="sig-block">
      <div class="sig-line">
        Secretaría / Dirección del Plantel<br>
        Firma y Sello Húmedo
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>
`;

    printWindow.document.write(html);
    printWindow.document.close();
  }
}