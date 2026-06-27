import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Transaccion {
  tipo: 'ingreso' | 'egreso';
  monto: number;
  desc: string;
  fecha: string;
}

@Component({
  selector: 'app-gestion-caja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-caja.html',
  styleUrl: './gestion-caja.css'
})
export class GestionCajaComponent implements OnInit {
  // Propiedades ligadas al formulario usando ngModel
  tipoTransaccion: 'ingreso' | 'egreso' = 'ingreso';
  montoInput: number | null = null;
  fechaInput: string = '';
  descripcionInput: string = '';

  
  balance: number = 0;
  historial: Transaccion[] = [];

  ngOnInit(): void {
    // Cargar datos persistidos al iniciar el componente
    const fondosData = localStorage.getItem('fondos_data');
    const balanceTotal = localStorage.getItem('balance_total');

    if (fondosData) {
      this.historial = JSON.parse(fondosData);
    }
    if (balanceTotal) {
      this.balance = parseFloat(balanceTotal);
    }
  }

  registrarMovimiento(): void {
    if (!this.montoInput || !this.descripcionInput || !this.fechaInput) {
      alert("Por favor, llena todos los campos necesarios.");
      return;
    }

    const montoNumeric = parseFloat(this.montoInput.toString());

    if (montoNumeric <= 0) {
      alert("El monto ingresado debe ser un valor positivo.");
      return;
    }

    // Actualizar balance analizando el tipo de flujo
    if (this.tipoTransaccion === 'ingreso') {
      this.balance += montoNumeric;
    } else {
      if (montoNumeric > this.balance) {
        alert("⚠️ Advertencia: Fondo no suficiente.");
        return;
      }
      this.balance -= montoNumeric;
    }

    // Insertar nueva transacción
    const nuevaTransaccion: Transaccion = {
      tipo: this.tipoTransaccion,
      monto: montoNumeric,
      desc: this.descripcionInput,
      fecha: this.fechaInput
    };

    this.historial.push(nuevaTransaccion);

    // Persistir datos actualizados en LocalStorage
    localStorage.setItem('fondos_data', JSON.stringify(this.historial));
    localStorage.setItem('balance_total', this.balance.toString());

    // Limpiar el formulario de forma reactiva
    this.resetFormulario();
  }

  exportarCajaExcel(): void {
    if (this.historial.length === 0) {
      alert("No existen movimientos registrados para exportar.");
      return;
    }

    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
    html += `<head><meta charset="utf-8">`;
    html += `<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Control de Caja</x:Name>`;
    html += `<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->`;
    html += `<style>`;
    html += `table { border-collapse: collapse; font-family: Segoe UI, sans-serif; width: 100%; }`;
    html += `th { background-color: #2b6cb0; color: white; font-weight: bold; border: 1px solid #cbd5e0; padding: 10px; text-align: center; }`;
    html += `td { border: 1px solid #cbd5e0; padding: 8px; text-align: center; }`;
    html += `.header-title { font-size: 16px; font-weight: bold; color: #2b6cb0; text-align: center; padding: 15px; }`;
    html += `.tipo-ingreso { color: #2f855a; font-weight: bold; background-color: #f0fff4; }`;
    html += `.tipo-egreso { color: #c53030; font-weight: bold; background-color: #fff5f5; }`;
    html += `.balance-row { font-weight: bold; background-color: #edf2f7; font-size: 1.05rem; }`;
    html += `</style></head><body>`;
    
    html += `<table>`;
    html += `<tr><td colspan="4" class="header-title">Reporte de Control de Caja y Fondos - JBA</td></tr>`;
    html += `<tr><td colspan="4" style="text-align: center; font-size: 10px; color: #718096;">Fecha de Generación: ${new Date().toLocaleDateString()}</td></tr>`;
    html += `<tr><th>FECHA</th><th>TIPO</th><th>DESCRIPCIÓN</th><th>MONTO</th></tr>`;
    
    this.historial.forEach(mov => {
      const tipoClass = mov.tipo === 'ingreso' ? ' class="tipo-ingreso"' : ' class="tipo-egreso"';
      html += `<tr>`;
      html += `<td>${mov.fecha}</td>`;
      html += `<td${tipoClass}>${mov.tipo.toUpperCase()}</td>`;
      html += `<td style="text-align: left;">${mov.desc}</td>`;
      html += `<td style="text-align: right; font-weight: 600;">$${mov.monto.toFixed(2)}</td>`;
      html += `</tr>`;
    });
    
    html += `<tr class="balance-row">`;
    html += `<td colspan="3" style="text-align: right; padding: 10px;">BALANCE TOTAL NETO:</td>`;
    html += `<td style="text-align: right; color: ${this.balance >= 0 ? '#2f855a' : '#c53030'};">$${this.balance.toFixed(2)}</td>`;
    html += `</tr>`;
    html += `</table></body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Reporte_Caja_Fondos_${new Date().toISOString().substring(0,10)}.xls`);
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private resetFormulario(): void {
    this.tipoTransaccion = 'ingreso';
    this.montoInput = null;
    this.fechaInput = '';
    this.descripcionInput = '';
  }
}