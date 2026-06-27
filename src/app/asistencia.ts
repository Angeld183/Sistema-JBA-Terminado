import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PersonalAsistencia {
  id: number;
  cedula: string;
  nombre: string;
  cargo: string;
  entrada: string;
  salida: string;
  estado: 'activo' | 'finalizado' | 'ausente';
}

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asistencia.html',
  styleUrl: './asistencia.css'
})
export class AsistenciaComponent implements OnInit, OnDestroy {
  // Hora en tiempo real
  horaActual: string = '';
  private relojIntervalId: any;

  // Lista cargada dinámicamente
  personalList: PersonalAsistencia[] = [];
  asistenciasDia: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.actualizarHora();
    this.relojIntervalId = setInterval(() => {
      this.actualizarHora();
    }, 1000);
    this.cargarDatosAsistencia();
  }

  ngOnDestroy(): void {
    if (this.relojIntervalId) {
      clearInterval(this.relojIntervalId);
    }
  }

  async cargarDatosAsistencia() {
    const token = localStorage.getItem("jba_token");
    if (!token) return;

    try {
      const [persResp, asisResp] = await Promise.all([
        fetch("http://localhost:5188/api/personal", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://localhost:5188/api/asistencias", { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      if (!persResp.ok || !asisResp.ok) {
        throw new Error("Error al obtener datos de asistencia de la API.");
      }

      const personal = await persResp.json();
      this.asistenciasDia = await asisResp.json();

      const activos = personal.filter((p: any) => p.estado === true);
      const hoyStr = new Date().toDateString();

      this.personalList = activos.map((emp: any) => {
        const asisHoy = this.asistenciasDia.find((a: any) => {
          if (a.ci_p.trim() !== emp.ci_p.trim()) return false;
          const entStr = a.entrada + (a.entrada.endsWith('Z') ? '' : 'Z');
          return new Date(entStr).toDateString() === hoyStr;
        });

        let entrada = "--:--";
        let salida = "--:--";
        let estado: 'activo' | 'finalizado' | 'ausente' = 'ausente';
        let idAsistencia = 0;

        if (asisHoy) {
          idAsistencia = asisHoy.id_dia;
          const entStr = asisHoy.entrada + (asisHoy.entrada.endsWith('Z') ? '' : 'Z');
          entrada = new Date(entStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (asisHoy.salida) {
            const salStr = asisHoy.salida + (asisHoy.salida.endsWith('Z') ? '' : 'Z');
            salida = new Date(salStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            estado = 'finalizado';
          } else {
            estado = 'activo';
          }
        }

        return {
          id: idAsistencia,
          cedula: emp.ci_p.trim(),
          nombre: emp.nombre_p,
          cargo: emp.cargo_p || 'Personal',
          entrada: entrada,
          salida: salida,
          estado: estado
        };
      });
      this.cdr.detectChanges();
    } catch (e) {
      console.error("Error al cargar asistencias:", e);
    }
  }

  private actualizarHora(): void {
    this.horaActual = new Date().toLocaleTimeString();
    this.cdr.detectChanges();
  }

  anunciarVoz(mensaje: string) {
    if ('speechSynthesis' in window) {
      // Detener cualquier reproducción en curso
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(mensaje);
      utterance.lang = 'es-ES';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  async escanearManual(cedula: string) {
    const cleanCedula = cedula ? cedula.trim() : "";
    if (!cleanCedula) return;

    const persona = this.personalList.find(p => p.cedula === cleanCedula);
    if (!persona) {
      this.anunciarVoz("Cédula no registrada o personal inactivo.");
      alert("❌ Error: Cédula no registrada en el personal activo.");
      return;
    }

    await this.escanearQR(persona);
  }

  async escanearQR(persona: PersonalAsistencia) {
    const token = localStorage.getItem("jba_token");
    if (!token) {
      alert("No has iniciado sesión o tu sesión ha expirado.");
      return;
    }

    const ahora = new Date().toISOString();
    const horaMarcada = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      if (persona.estado === 'ausente') {
        const payload = {
          ci_p: persona.cedula,
          entrada: ahora,
          salida: null
        };

        const response = await fetch("http://localhost:5188/api/asistencias", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          this.anunciarVoz("Bienvenido, " + persona.nombre + ". Entrada registrada.");
          alert(`✅ Entrada registrada exitosamente vía QR para: ${persona.nombre} a las ${horaMarcada}`);
          await this.cargarDatosAsistencia();
        } else {
          const errText = await response.text();
          alert(`Error al registrar entrada: ${errText}`);
        }
      } else if (persona.estado === 'activo') {
        const payload = {
          ci_p: persona.cedula,
          entrada: ahora,
          salida: ahora
        };

        const response = await fetch(`http://localhost:5188/api/asistencias/${persona.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          this.anunciarVoz("Hasta luego, " + persona.nombre + ". Salida registrada.");
          alert(`✅ Salida registrada exitosamente vía QR para: ${persona.nombre} a las ${horaMarcada}`);
          await this.cargarDatosAsistencia();
        } else {
          const errText = await response.text();
          alert(`Error al registrar salida: ${errText}`);
        }
      } else {
        this.anunciarVoz(persona.nombre + " ya completó su jornada.");
        alert("Esta persona ya ha completado su jornada de hoy (entrada y salida registradas).");
      }
    } catch (error) {
      console.error("Error al registrar asistencia QR:", error);
      alert("No se pudo conectar con el servidor para registrar asistencia.");
    }
  }

  exportarAsistenciaExcel() {
    if (this.personalList.length === 0) {
      alert("No hay registros para exportar.");
      return;
    }

    const title = "Reporte de Asistencia Diaria - JBA";
    const headers = ["NOMBRE", "CÉDULA", "ENTRADA", "SALIDA", "ESTADO"];
    
    // Armar filas
    const rows = this.personalList.map(p => [
      p.nombre,
      p.cedula,
      p.entrada,
      p.salida,
      p.estado === 'finalizado' ? 'COMPLETADO' : (p.estado === 'activo' ? 'TRABAJANDO' : 'AUSENTE')
    ]);

    // Generar formato HTML de tabla para abrir en Excel
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
    html += `<head><meta charset="utf-8">`;
    html += `<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Asistencias</x:Name>`;
    html += `<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->`;
    html += `<style>`;
    html += `table { border-collapse: collapse; font-family: Segoe UI, sans-serif; width: 100%; }`;
    html += `th { background-color: #2b6cb0; color: white; font-weight: bold; border: 1px solid #cbd5e0; padding: 10px; text-align: center; }`;
    html += `td { border: 1px solid #cbd5e0; padding: 8px; text-align: center; }`;
    html += `.header-title { font-size: 16px; font-weight: bold; color: #2b6cb0; text-align: center; padding: 15px; }`;
    html += `.estado-comp { color: #4a5568; font-weight: bold; }`;
    html += `.estado-trab { color: #2f855a; font-weight: bold; }`;
    html += `.estado-aus { color: #c53030; font-weight: bold; }`;
    html += `</style></head><body>`;
    
    html += `<table>`;
    html += `<tr><td colspan="5" class="header-title">${title}</td></tr>`;
    html += `<tr><td colspan="5" style="text-align: center; font-size: 10px; color: #718096;">Fecha del Reporte: ${new Date().toLocaleDateString()}</td></tr>`;
    html += `<tr><th>${headers.join('</th><th>')}</th></tr>`;
    
    rows.forEach(r => {
      let estadoClass = '';
      if (r[4] === 'COMPLETADO') estadoClass = ' class="estado-comp"';
      else if (r[4] === 'TRABAJANDO') estadoClass = ' class="estado-trab"';
      else estadoClass = ' class="estado-aus"';

      html += `<tr>`;
      html += `<td>${r[0]}</td>`;
      html += `<td>${r[1]}</td>`;
      html += `<td>${r[2]}</td>`;
      html += `<td>${r[3]}</td>`;
      html += `<td${estadoClass}>${r[4]}</td>`;
      html += `</tr>`;
    });
    
    html += `</table></body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Reporte_Asistencia_${new Date().toISOString().substring(0,10)}.xls`);
    a.click();
    window.URL.revokeObjectURL(url);
  }

  imprimirCarnet(persona: PersonalAsistencia) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(persona.cedula)}`;
    const fecha = new Date().getFullYear();

    const carnetHtml = `
      <html>
      <head>
        <title>Carnet de Identificación - ${persona.nombre}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f0f2f5;
            font-family: 'Inter', sans-serif;
          }
          .carnet {
            width: 320px;
            height: 500px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            overflow: hidden;
            position: relative;
            display: flex;
            flex-direction: column;
            border: 1px solid #e2e8f0;
          }
          .header {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            padding: 24px 20px 40px;
            text-align: center;
            position: relative;
          }
          .header::after {
            content: '';
            position: absolute;
            bottom: -20px;
            left: 0;
            right: 0;
            height: 40px;
            background: white;
            border-top-left-radius: 50%;
            border-top-right-radius: 50%;
          }
          .institution {
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin: 0;
          }
          .year {
            font-size: 12px;
            opacity: 0.8;
            margin-top: 4px;
          }
          .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0 20px 20px;
            background: white;
            z-index: 1;
          }
          .qr-container {
            background: white;
            padding: 10px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            margin-top: -30px;
            border: 1px solid #e2e8f0;
            margin-bottom: 20px;
          }
          .qr-code {
            width: 140px;
            height: 140px;
            display: block;
          }
          .info {
            text-align: center;
            width: 100%;
          }
          .name {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 8px;
            line-height: 1.2;
          }
          .role {
            font-size: 14px;
            font-weight: 600;
            color: #3b82f6;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 16px;
            padding: 4px 12px;
            background: #eff6ff;
            border-radius: 9999px;
            display: inline-block;
          }
          .cedula-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 2px;
          }
          .cedula {
            font-size: 16px;
            font-weight: 600;
            color: #334155;
            margin: 0;
          }
          .footer {
            background: #f8fafc;
            padding: 12px;
            text-align: center;
            font-size: 10px;
            color: #64748b;
            border-top: 1px solid #f1f5f9;
          }
          @media print {
            body {
              background: none;
              justify-content: flex-start;
              align-items: flex-start;
            }
            .carnet {
              box-shadow: none;
              border: 1px solid #cbd5e1;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="carnet">
          <div class="header">
            <h1 class="institution">Unidad Educativa J.B.A.</h1>
            <div class="year">Período ${fecha}</div>
          </div>
          <div class="content">
            <div class="qr-container">
              <img src="${qrUrl}" alt="Código QR" class="qr-code" />
            </div>
            <div class="info">
              <h2 class="name">${persona.nombre}</h2>
              <div class="role">${persona.cargo}</div>
              <div class="cedula-label">Cédula de Identidad</div>
              <p class="cedula">${persona.cedula}</p>
            </div>
          </div>
          <div class="footer">
            Este carnet es personal e intransferible.<br>En caso de pérdida, reportar a la institución.
          </div>
        </div>
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              setTimeout(() => {
                window.close();
              }, 500);
            }, 500); // Give time for QR image to load
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(carnetHtml);
      printWindow.document.close();
    }
  }
}