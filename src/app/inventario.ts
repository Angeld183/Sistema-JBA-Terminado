import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Deposito {
  id_deposito: number;
  nombre_d: string;
  id_aula: number | null;
}

interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
}

interface Producto {
  id_producto: number;
  codigo_corto: string;
  descripcion: string;
  id_categoria: number;
  cant_min: number;
}

interface StockDeposito {
  id_stock: number;
  id_deposito: number;
  id_producto: number;
  cantidad: number;
  cantidad_min: number;
  producto?: Producto;
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class InventarioComponent implements OnInit {
  // Datos principales
  depositos: Deposito[] = [];
  categorias: Categoria[] = [];
  productos: Producto[] = [];
  todosLosStocks: StockDeposito[] = [];

  // Vista activa y navegación
  salaSeleccionada: Deposito | null = null;
  stocksFiltradosSala: StockDeposito[] = [];
  searchTerm: string = '';

  // Control de Modales
  modalIngresoAbierto: boolean = false;
  modalTrasladoAbierto: boolean = false;
  modalCategoriasAbierto: boolean = false;
  modalEdicionAbierto: boolean = false;

  // Variables de formularios
  // Ingreso
  nombreIngreso: string = '';
  codigoIngreso: string = '';
  cantidadIngreso: number = 1;
  minimoIngreso: number = 1;
  categoriaIngresoId: number | null = null;
  depositoIngresoId: number | null = null;

  // Traslado
  codigoTraslado: string = '';
  origenTrasladoId: number | null = null;
  destinoTrasladoId: number | null = null;
  cantidadTraslado: number = 1;
  motivoTraslado: string = 'Traslado regular de inventario';

  // Edición Stock
  stockEdicionSeleccionado: StockDeposito | null = null;
  cantidadEdicion: number = 0;
  minimoEdicion: number = 0;

  // Categoría Nueva
  nuevaCategoriaNombre: string = '';

  // Mensaje / Alerta personalizada
  alertaMensaje: string = '';
  alertaTipo: 'success' | 'danger' | 'warning' | '' = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Helper para headers
  getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("jba_token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  }

  mostrarAlerta(mensaje: string, tipo: 'success' | 'danger' | 'warning'): void {
    this.alertaMensaje = mensaje;
    this.alertaTipo = tipo;
    setTimeout(() => {
      this.alertaMensaje = '';
      this.alertaTipo = '';
      this.cdr.detectChanges();
    }, 4000);
    this.cdr.detectChanges();
  }

  async cargarDatos(): Promise<void> {
    try {
      const headers = this.getAuthHeaders();
      const [depResp, catResp, prodResp, stockResp] = await Promise.all([
        fetch("http://localhost:5188/api/depositos", { headers }),
        fetch("http://localhost:5188/api/categorias", { headers }),
        fetch("http://localhost:5188/api/productos", { headers }),
        fetch("http://localhost:5188/api/stockdepositos", { headers })
      ]);

      if (!depResp.ok || !catResp.ok || !prodResp.ok || !stockResp.ok) {
        throw new Error("Error al obtener los datos del servidor.");
      }

      this.depositos = await depResp.json();
      this.categorias = await catResp.json();
      this.productos = await prodResp.json();
      this.todosLosStocks = await stockResp.json();

      // Sincronizar listas activas si hay una sala seleccionada
      if (this.salaSeleccionada) {
        const encontrada = this.depositos.find(d => d.id_deposito === this.salaSeleccionada?.id_deposito);
        if (encontrada) {
          this.abrirDetalle(encontrada);
        }
      }

      this.cdr.detectChanges();
    } catch (err: any) {
      console.error(err);
      this.mostrarAlerta("No se pudo conectar con el servidor para cargar el inventario.", "danger");
    }
  }

  abrirDetalle(sala: Deposito): void {
    this.salaSeleccionada = sala;
    this.filtrarStockSala();
  }

  volver(): void {
    this.salaSeleccionada = null;
    this.stocksFiltradosSala = [];
    this.searchTerm = '';
    this.cdr.detectChanges();
  }

  filtrarStockSala(): void {
    if (!this.salaSeleccionada) return;
    this.stocksFiltradosSala = this.todosLosStocks.filter(
      s => s.id_deposito === this.salaSeleccionada?.id_deposito
    );
    this.cdr.detectChanges();
  }

  getStocksFiltradosPorBusqueda(): StockDeposito[] {
    if (!this.searchTerm) return this.stocksFiltradosSala;
    const cleanSearch = this.searchTerm.toLowerCase().trim();
    return this.stocksFiltradosSala.filter(s => 
      s.producto?.codigo_corto.toLowerCase().includes(cleanSearch) || 
      s.producto?.descripcion.toLowerCase().includes(cleanSearch)
    );
  }

  // Contadores rápidos para la grilla de salas
  getCantidadItemsSala(idDeposito: number): number {
    return this.todosLosStocks.filter(s => s.id_deposito === idDeposito).length;
  }

  // Siglas decorativas de las tarjetas
  getSiglaSala(nombre: string): string {
    if (nombre === "Depósito General") return "DG";
    const match = nombre.match(/\d+/);
    if (match) return `S${match[0]}`;
    return nombre.substring(0, 2).toUpperCase();
  }

  // Modales
  abrirModalIngreso(): void {
    this.nombreIngreso = '';
    this.codigoIngreso = '';
    this.cantidadIngreso = 1;
    this.minimoIngreso = 1;
    // Seleccionar por defecto la sala actual si se está dentro de una
    this.depositoIngresoId = this.salaSeleccionada ? this.salaSeleccionada.id_deposito : (this.depositos[0]?.id_deposito || null);
    
    // Seleccionar categoría general por defecto
    const catGeneral = this.categorias.find(c => c.nombre_categoria === "General");
    this.categoriaIngresoId = catGeneral ? catGeneral.id_categoria : (this.categorias[0]?.id_categoria || null);

    this.modalIngresoAbierto = true;
  }

  abrirModalTraslado(): void {
    this.codigoTraslado = '';
    this.origenTrasladoId = this.salaSeleccionada ? this.salaSeleccionada.id_deposito : (this.depositos[0]?.id_deposito || null);
    
    // Seleccionar destino diferente al de origen por defecto
    const otroDep = this.depositos.find(d => d.id_deposito !== this.origenTrasladoId);
    this.destinoTrasladoId = otroDep ? otroDep.id_deposito : null;
    
    this.cantidadTraslado = 1;
    this.motivoTraslado = 'Traslado regular de inventario';
    this.modalTrasladoAbierto = true;
  }

  abrirModalCategorias(): void {
    this.nuevaCategoriaNombre = '';
    this.modalCategoriasAbierto = true;
  }

  abrirModalEdicion(stock: StockDeposito): void {
    this.stockEdicionSeleccionado = stock;
    this.cantidadEdicion = stock.cantidad;
    this.minimoEdicion = stock.cantidad_min;
    this.modalEdicionAbierto = true;
  }

  cerrarModales(): void {
    this.modalIngresoAbierto = false;
    this.modalTrasladoAbierto = false;
    this.modalCategoriasAbierto = false;
    this.modalEdicionAbierto = false;
    this.stockEdicionSeleccionado = null;
  }

  // Registrar / Ingresar Producto
  async ingresarMaterial(): Promise<void> {
    if (!this.codigoIngreso || !this.nombreIngreso || !this.depositoIngresoId || !this.categoriaIngresoId) {
      this.mostrarAlerta("Por favor, rellene todos los campos requeridos.", "warning");
      return;
    }

    if (this.cantidadIngreso <= 0 || this.minimoIngreso < 0) {
      this.mostrarAlerta("Verifique las cantidades ingresadas.", "warning");
      return;
    }

    try {
      const headers = this.getAuthHeaders();
      const codeUpper = this.codigoIngreso.trim().toUpperCase();

      // 1. Buscar si el producto ya existe en el catálogo
      let prodId: number | null = null;
      const prodResp = await fetch(`http://localhost:5188/api/productos/buscar/${codeUpper}`, { headers });
      
      if (prodResp.ok) {
        const prod = await prodResp.json();
        prodId = prod.id_producto;
      } else {
        // No existe el producto, se debe crear en la base de datos
        const newProdResp = await fetch("http://localhost:5188/api/productos", {
          method: "POST",
          headers,
          body: JSON.stringify({
            id_categoria: this.categoriaIngresoId,
            codigo_corto: codeUpper,
            descripcion: this.nombreIngreso.trim(),
            cant_min: this.minimoIngreso
          })
        });

        if (!newProdResp.ok) {
          throw new Error("No se pudo crear el producto en el catálogo.");
        }

        const createdProd = await newProdResp.json();
        prodId = createdProd.id_producto;
      }

      if (!prodId) throw new Error("ID de producto inválido.");

      // 2. Registrar el stock en el depósito
      const stockResp = await fetch("http://localhost:5188/api/stockdepositos", {
        method: "POST",
        headers,
        body: JSON.stringify({
          id_deposito: this.depositoIngresoId,
          id_producto: prodId,
          cantidad: this.cantidadIngreso,
          cantidad_min: this.minimoIngreso
        })
      });

      if (!stockResp.ok) {
        throw new Error("No se pudo asociar el stock al depósito.");
      }

      this.mostrarAlerta("Material ingresado correctamente.", "success");
      this.cerrarModales();
      await this.cargarDatos();
    } catch (err: any) {
      console.error(err);
      this.mostrarAlerta(err.message || "Error al registrar el producto.", "danger");
    }
  }

  // Trasladar Material
  async trasladarMaterial(): Promise<void> {
    if (!this.codigoTraslado || !this.origenTrasladoId || !this.destinoTrasladoId) {
      this.mostrarAlerta("Rellene los campos obligatorios para el traslado.", "warning");
      return;
    }

    if (this.origenTrasladoId === this.destinoTrasladoId) {
      this.mostrarAlerta("El depósito de origen y de destino no pueden ser el mismo.", "warning");
      return;
    }

    if (this.cantidadTraslado <= 0) {
      this.mostrarAlerta("Ingrese una cantidad de traslado válida.", "warning");
      return;
    }

    try {
      const headers = this.getAuthHeaders();
      const codeUpper = this.codigoTraslado.trim().toUpperCase();

      // 1. Validar la existencia del producto por su código
      const prodResp = await fetch(`http://localhost:5188/api/productos/buscar/${codeUpper}`, { headers });
      if (!prodResp.ok) {
        this.mostrarAlerta(`El producto con código ${codeUpper} no existe en el catálogo.`, "danger");
        return;
      }

      const prod = await prodResp.json();

      // Obtener cédula del personal para la auditoría de traslados
      const userJson = localStorage.getItem("jba_user");
      let ci_p = "SYSTEM";
      if (userJson) {
        const user = JSON.parse(userJson);
        ci_p = user.ci_p || "SYSTEM";
      }

      // 2. Enviar el registro de traslado al backend
      const transResp = await fetch("http://localhost:5188/api/traslados", {
        method: "POST",
        headers,
        body: JSON.stringify({
          id_dep_origen: this.origenTrasladoId,
          id_dep_destino: this.destinoTrasladoId,
          id_producto: prod.id_producto,
          cantidad_tr: this.cantidadTraslado,
          ci_p: ci_p,
          fecha_tr: new Date().toISOString(),
          motivo: this.motivoTraslado.trim() || 'Traslado regular de inventario'
        })
      });

      if (!transResp.ok) {
        const errorText = await transResp.text();
        throw new Error(errorText || "Error en el servidor al realizar el traslado.");
      }

      this.mostrarAlerta("Traslado procesado exitosamente.", "success");
      this.cerrarModales();
      await this.cargarDatos();
    } catch (err: any) {
      console.error(err);
      this.mostrarAlerta(err.message || "Error al procesar el traslado.", "danger");
    }
  }

  // Guardar Edición Directa de Stock
  async guardarEdicionStock(): Promise<void> {
    if (!this.stockEdicionSeleccionado) return;

    if (this.cantidadEdicion < 0 || this.minimoEdicion < 0) {
      this.mostrarAlerta("Las cantidades no pueden ser negativas.", "warning");
      return;
    }

    try {
      const headers = this.getAuthHeaders();
      const resp = await fetch(`http://localhost:5188/api/stockdepositos/${this.stockEdicionSeleccionado.id_stock}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          id_deposito: this.stockEdicionSeleccionado.id_deposito,
          id_producto: this.stockEdicionSeleccionado.id_producto,
          cantidad: this.cantidadEdicion,
          cantidad_min: this.minimoEdicion
        })
      });

      if (!resp.ok) {
        throw new Error("No se pudo actualizar el stock en el servidor.");
      }

      this.mostrarAlerta("Stock actualizado correctamente.", "success");
      this.cerrarModales();
      await this.cargarDatos();
    } catch (err: any) {
      console.error(err);
      this.mostrarAlerta(err.message || "Error al actualizar stock.", "danger");
    }
  }

  // Eliminar Stock del Depósito
  async eliminarStock(stock: StockDeposito): Promise<void> {
    const confirmar = confirm(`¿Está seguro de que desea retirar por completo el producto "${stock.producto?.descripcion}" de esta sala?`);
    if (!confirmar) return;

    try {
      const headers = this.getAuthHeaders();
      const resp = await fetch(`http://localhost:5188/api/stockdepositos/${stock.id_stock}`, {
        method: "DELETE",
        headers
      });

      if (!resp.ok) {
        throw new Error("No se pudo eliminar el stock.");
      }

      this.mostrarAlerta("El material fue retirado de la sala.", "success");
      await this.cargarDatos();
    } catch (err: any) {
      console.error(err);
      this.mostrarAlerta(err.message || "Error al retirar stock.", "danger");
    }
  }

  // Crear Categoría
  async crearCategoria(): Promise<void> {
    if (!this.nuevaCategoriaNombre.trim()) {
      this.mostrarAlerta("Ingrese un nombre de categoría válido.", "warning");
      return;
    }

    try {
      const headers = this.getAuthHeaders();
      const resp = await fetch("http://localhost:5188/api/categorias", {
        method: "POST",
        headers,
        body: JSON.stringify({
          nombre_categoria: this.nuevaCategoriaNombre.trim()
        })
      });

      if (!resp.ok) {
        throw new Error("Error al crear la categoría.");
      }

      this.mostrarAlerta("Categoría creada con éxito.", "success");
      this.nuevaCategoriaNombre = '';
      await this.cargarDatos();
    } catch (err: any) {
      console.error(err);
      this.mostrarAlerta(err.message || "Error al crear la categoría.", "danger");
    }
  }

  // Exportar Inventario Completo Consolidado a Excel
  exportarInventarioExcel(): void {
    if (this.todosLosStocks.length === 0) {
      this.mostrarAlerta("No hay existencias en el inventario para exportar.", "warning");
      return;
    }

    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
    html += `<head><meta charset="utf-8">`;
    html += `<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Inventario de Materiales</x:Name>`;
    html += `<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->`;
    html += `<style>`;
    html += `table { border-collapse: collapse; font-family: Segoe UI, sans-serif; width: 100%; }`;
    html += `th { background-color: #4f46e5; color: white; font-weight: bold; border: 1px solid #cbd5e0; padding: 10px; text-align: center; }`;
    html += `td { border: 1px solid #cbd5e0; padding: 8px; text-align: center; }`;
    html += `.header-title { font-size: 16px; font-weight: bold; color: #4f46e5; text-align: center; padding: 15px; }`;
    html += `.stock-bajo { color: #dc2626; font-weight: bold; background-color: #fee2e2; }`;
    html += `.stock-normal { color: #16a34a; font-weight: bold; }`;
    html += `</style></head><body>`;
    
    html += `<table>`;
    html += `<tr><td colspan="6" class="header-title">Reporte de Inventario de Materiales Consolidado - JBA</td></tr>`;
    html += `<tr><td colspan="6" style="text-align: center; font-size: 10px; color: #718096;">Fecha de Generación: ${new Date().toLocaleDateString()}</td></tr>`;
    html += `<tr><th>SALA / UBICACIÓN</th><th>CÓDIGO</th><th>DESCRIPCIÓN</th><th>CATEGORÍA</th><th>STOCK ACTUAL</th><th>STOCK MÍNIMO</th></tr>`;
    
    this.depositos.forEach(dep => {
      const stocksSala = this.todosLosStocks.filter(s => s.id_deposito === dep.id_deposito);
      if (stocksSala.length > 0) {
        stocksSala.forEach(s => {
          const cat = this.categorias.find(c => c.id_categoria === s.producto?.id_categoria);
          const catNombre = cat ? cat.nombre_categoria : 'Sin Categoría';
          const esBajo = s.cantidad < s.cantidad_min;
          const stockClass = esBajo ? ' class="stock-bajo"' : ' class="stock-normal"';

          html += `<tr>`;
          html += `<td style="font-weight: 600; text-align: left;">${dep.nombre_d}</td>`;
          html += `<td>${s.producto?.codigo_corto || 'N/A'}</td>`;
          html += `<td style="text-align: left;">${s.producto?.descripcion || 'N/A'}</td>`;
          html += `<td>${catNombre}</td>`;
          html += `<td${stockClass}>${s.cantidad}</td>`;
          html += `<td>${s.cantidad_min}</td>`;
          html += `</tr>`;
        });
      } else {
        html += `<tr>`;
        html += `<td style="font-weight: 600; text-align: left;">${dep.nombre_d}</td>`;
        html += `<td colspan="5" style="color: #a0aec0; font-style: italic;">Sin materiales registrados</td>`;
        html += `</tr>`;
      }
    });
    
    html += `</table></body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Reporte_Inventario_${new Date().toISOString().substring(0,10)}.xls`);
    a.click();
    window.URL.revokeObjectURL(url);
    this.mostrarAlerta("Reporte Excel descargado.", "success");
  }
}
