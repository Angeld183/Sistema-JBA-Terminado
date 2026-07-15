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

  // Proveedores y representantes (Colaboradores)
  todosLosProveedores: any[] = [];
  todosLosRepresentantes: any[] = [];
  personasDisponibles: any[] = []; // Lista unificada de búsqueda
  personasFiltradas: any[] = [];
  searchPersonaTerm: string = '';
  personaSeleccionada: any | null = null;
  mostrarDropdownPersonas: boolean = false;

  // Variables para la creación de Proveedor
  modalProveedoresAbierto: boolean = false;
  nuevoProveedorNombre: string = '';
  nuevoProveedorNum: string = '';

  // Autocompletado de Productos
  productosFiltradosIngreso: any[] = [];
  mostrarDropdownProductosIngreso: boolean = false;
  productosFiltradosTraslado: any[] = [];
  mostrarDropdownProductosTraslado: boolean = false;

  // Soporte Multiobjeto
  elementosIngreso: any[] = [];
  elementosTraslado: any[] = [];

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
      const [depResp, catResp, prodResp, stockResp, provResp, repResp] = await Promise.all([
        fetch("http://localhost:5188/api/depositos", { headers }),
        fetch("http://localhost:5188/api/categorias", { headers }),
        fetch("http://localhost:5188/api/productos", { headers }),
        fetch("http://localhost:5188/api/stockdepositos", { headers }),
        fetch("http://localhost:5188/api/proveedores", { headers }).catch(e => null),
        fetch("http://localhost:5188/api/representantes", { headers }).catch(e => null)
      ]);

      if (!depResp.ok || !catResp.ok || !prodResp.ok || !stockResp.ok) {
        throw new Error("Error al obtener los datos del servidor.");
      }

      this.depositos = await depResp.json();
      this.categorias = await catResp.json();
      this.productos = await prodResp.json();
      this.todosLosStocks = await stockResp.json();

      if (provResp && provResp.ok) {
        this.todosLosProveedores = await provResp.json();
      }
      if (repResp && repResp.ok) {
        this.todosLosRepresentantes = await repResp.json();
      }
      this.construirListaPersonas();

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

  construirListaPersonas(): void {
    const providersMapped = this.todosLosProveedores.map(p => ({
      tipo: 'proveedor',
      id: p.id_proveedor,
      nombre: p.nombre_proveedor,
      identificacion: p.num_proveedor
    }));
    const repsMapped = this.todosLosRepresentantes.map(r => ({
      tipo: 'colaborador',
      id: r.ci_representante,
      nombre: r.nombre_representante,
      identificacion: r.ci_representante
    }));
    this.personasDisponibles = [...providersMapped, ...repsMapped];
  }

  filtrarPersonas(): void {
    this.mostrarDropdownPersonas = true;
    if (!this.searchPersonaTerm) {
      this.personasFiltradas = [];
      return;
    }
    const term = this.searchPersonaTerm.toLowerCase().trim();
    this.personasFiltradas = this.personasDisponibles.filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      p.identificacion.toLowerCase().includes(term)
    ).slice(0, 10);
  }

  seleccionarPersona(persona: any): void {
    this.personaSeleccionada = persona;
    this.searchPersonaTerm = `${persona.nombre} (${persona.tipo === 'proveedor' ? 'Proveedor' : 'Colaborador'})`;
    this.mostrarDropdownPersonas = false;
  }

  deseleccionarPersona(): void {
    this.personaSeleccionada = null;
    this.searchPersonaTerm = '';
    this.personasFiltradas = [];
  }

  abrirModalProveedores(): void {
    this.nuevoProveedorNombre = '';
    this.nuevoProveedorNum = '';
    this.modalProveedoresAbierto = true;
  }

  async crearProveedor(): Promise<void> {
    if (!this.nuevoProveedorNombre.trim() || !this.nuevoProveedorNum.trim()) {
      this.mostrarAlerta("Por favor, llene todos los campos para el proveedor.", "warning");
      return;
    }
    try {
      const headers = this.getAuthHeaders();
      const resp = await fetch("http://localhost:5188/api/proveedores", {
        method: "POST",
        headers,
        body: JSON.stringify({
          nombre_proveedor: this.nuevoProveedorNombre.trim(),
          num_proveedor: this.nuevoProveedorNum.trim()
        })
      });
      if (!resp.ok) throw new Error("Error al crear el proveedor.");
      this.mostrarAlerta("Proveedor creado exitosamente.", "success");
      this.nuevoProveedorNombre = '';
      this.nuevoProveedorNum = '';
      this.modalProveedoresAbierto = false;
      await this.cargarDatos();
    } catch (err: any) {
      console.error(err);
      this.mostrarAlerta(err.message || "Error al registrar proveedor.", "danger");
    }
  }

  filtrarProductosIngreso() {
    this.mostrarDropdownProductosIngreso = true;
    const term = this.codigoIngreso.toLowerCase().trim();
    if (!term) {
      this.productosFiltradosIngreso = [];
      return;
    }
    this.productosFiltradosIngreso = this.productos.filter(p => 
      p.codigo_corto.toLowerCase().includes(term) || 
      p.descripcion.toLowerCase().includes(term)
    ).slice(0, 10);
  }

  seleccionarProductoIngreso(p: any) {
    this.codigoIngreso = p.codigo_corto;
    this.nombreIngreso = p.descripcion;
    this.categoriaIngresoId = p.id_categoria;
    this.minimoIngreso = p.cant_min || 1;
    this.mostrarDropdownProductosIngreso = false;
  }

  filtrarProductosTraslado() {
    this.mostrarDropdownProductosTraslado = true;
    const term = this.codigoTraslado.toLowerCase().trim();
    if (!term) {
      this.productosFiltradosTraslado = [];
      return;
    }
    this.productosFiltradosTraslado = this.productos.filter(p => 
      p.codigo_corto.toLowerCase().includes(term) || 
      p.descripcion.toLowerCase().includes(term)
    ).slice(0, 10);
  }

  seleccionarProductoTraslado(p: any) {
    this.codigoTraslado = p.codigo_corto;
    this.mostrarDropdownProductosTraslado = false;
  }

  agregarElementoIngreso() {
    if (!this.codigoIngreso || !this.nombreIngreso || this.cantidadIngreso <= 0) {
      this.mostrarAlerta("Llene los campos del producto con cantidades válidas.", "warning");
      return;
    }
    const code = this.codigoIngreso.trim().toUpperCase();
    const existing = this.elementosIngreso.find(e => e.codigo === code);
    if (existing) {
      existing.cantidad += this.cantidadIngreso;
    } else {
      const cat = this.categorias.find(c => c.id_categoria === this.categoriaIngresoId);
      this.elementosIngreso.push({
        codigo: code,
        nombre: this.nombreIngreso.trim(),
        cantidad: this.cantidadIngreso,
        minimo: this.minimoIngreso,
        id_categoria: this.categoriaIngresoId,
        categoriaNombre: cat ? cat.nombre_categoria : 'General'
      });
    }
    // Limpiar campos de producto
    this.codigoIngreso = '';
    this.nombreIngreso = '';
    this.cantidadIngreso = 1;
    this.minimoIngreso = 1;
  }

  eliminarElementoIngreso(index: number) {
    this.elementosIngreso.splice(index, 1);
  }

  agregarElementoTraslado() {
    if (!this.codigoTraslado || this.cantidadTraslado <= 0) {
      this.mostrarAlerta("Ingrese un código de producto y una cantidad válida.", "warning");
      return;
    }
    const code = this.codigoTraslado.trim().toUpperCase();
    const prod = this.productos.find(p => p.codigo_corto === code);
    if (!prod) {
      this.mostrarAlerta(`El producto con código "${code}" no existe en el catálogo.`, "warning");
      return;
    }
    const existing = this.elementosTraslado.find(e => e.codigo === code);
    if (existing) {
      existing.cantidad += this.cantidadTraslado;
    } else {
      this.elementosTraslado.push({
        id_producto: prod.id_producto,
        codigo: code,
        nombre: prod.descripcion,
        cantidad: this.cantidadTraslado
      });
    }
    // Limpiar campos
    this.codigoTraslado = '';
    this.cantidadTraslado = 1;
  }

  eliminarElementoTraslado(index: number) {
    this.elementosTraslado.splice(index, 1);
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
    this.deseleccionarPersona();
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
    this.modalProveedoresAbierto = false;
    this.stockEdicionSeleccionado = null;
    this.deseleccionarPersona();
    this.elementosIngreso = [];
    this.elementosTraslado = [];
    this.productosFiltradosIngreso = [];
    this.mostrarDropdownProductosIngreso = false;
    this.productosFiltradosTraslado = [];
    this.mostrarDropdownProductosTraslado = false;
  }

  // Registrar / Ingresar Producto
  async ingresarMaterial(): Promise<void> {
    if (!this.depositoIngresoId || !this.categoriaIngresoId) {
      this.mostrarAlerta("Por favor, seleccione la sala y categoría de destino.", "warning");
      return;
    }

    // Fallback: si la lista temporal de elementos está vacía, intentar agregar los campos actuales
    if (this.elementosIngreso.length === 0) {
      if (this.codigoIngreso && this.nombreIngreso && this.cantidadIngreso > 0) {
        const codeUpper = this.codigoIngreso.trim().toUpperCase();
        const cat = this.categorias.find(c => c.id_categoria === this.categoriaIngresoId);
        this.elementosIngreso.push({
          codigo: codeUpper,
          nombre: this.nombreIngreso.trim(),
          cantidad: this.cantidadIngreso,
          minimo: this.minimoIngreso,
          id_categoria: this.categoriaIngresoId,
          categoriaNombre: cat ? cat.nombre_categoria : 'General'
        });
      } else {
        this.mostrarAlerta("Debe agregar al menos un material a la lista.", "warning");
        return;
      }
    }

    try {
      const headers = this.getAuthHeaders();
      const resolvedItems: any[] = [];

      // 1. Resolver todos los productos (buscar o crear en catálogo)
      for (const item of this.elementosIngreso) {
        let prodId: number | null = null;
        const prodResp = await fetch(`http://localhost:5188/api/productos/buscar/${item.codigo}`, { headers });
        
        if (prodResp.ok) {
          const prod = await prodResp.json();
          prodId = prod.id_producto;
        } else {
          const newProdResp = await fetch("http://localhost:5188/api/productos", {
            method: "POST",
            headers,
            body: JSON.stringify({
              id_categoria: item.id_categoria,
              codigo_corto: item.codigo,
              descripcion: item.nombre,
              cant_min: item.minimo
            })
          });

          if (!newProdResp.ok) {
            throw new Error(`No se pudo crear el producto ${item.codigo} en el catálogo.`);
          }

          const createdProd = await newProdResp.json();
          prodId = createdProd.id_producto;
        }

        if (!prodId) throw new Error(`ID inválido para el producto ${item.codigo}.`);
        resolvedItems.push({
          ...item,
          id_producto: prodId
        });
      }

      // 2. Si se seleccionó un colaborador o proveedor, registrar en Colaboracion y Recepcion
      if (this.personaSeleccionada) {
        try {
          const userJson = localStorage.getItem("jba_user");
          let ci_p = "SYSTEM";
          if (userJson) {
            const user = JSON.parse(userJson);
            ci_p = user.ci_p || "SYSTEM";
          }

          const colabPayload = {
            id_proveedor: this.personaSeleccionada.tipo === 'proveedor' ? this.personaSeleccionada.id : null,
            ci_representante: this.personaSeleccionada.tipo === 'colaborador' ? this.personaSeleccionada.id : null,
            ci_p: ci_p,
            fecha_registro: new Date().toISOString(),
            observacion: `Recepción de ${resolvedItems.length} materiales en inventario`
          };

          const colabResp = await fetch("http://localhost:5188/api/colaboraciones", {
            method: "POST",
            headers,
            body: JSON.stringify(colabPayload)
          });

          if (colabResp.ok) {
            const colab = await colabResp.json();
            const id_orden = colab.id_orden;

            const recpResp = await fetch("http://localhost:5188/api/recepciones", {
              method: "POST",
              headers,
              body: JSON.stringify({
                id_orden: id_orden,
                ci_p: ci_p,
                fecha_registro: new Date().toISOString()
              })
            });

            if (recpResp.ok) {
              const recp = await recpResp.json();
              const id_recepcion = recp.id_recepcion;

              for (const rit of resolvedItems) {
                await fetch("http://localhost:5188/api/detallerecepciones", {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    id_recepcion: id_recepcion,
                    id_producto: rit.id_producto,
                    cantidad_re: rit.cantidad,
                    fecha_vencimiento: null
                  })
                });
              }
            }
          }
        } catch (e) {
          console.error("Error al registrar auditoria de ingreso:", e);
        }
      }

      // 3. Registrar los stocks en el depósito
      for (const rit of resolvedItems) {
        const stockResp = await fetch("http://localhost:5188/api/stockdepositos", {
          method: "POST",
          headers,
          body: JSON.stringify({
            id_deposito: this.depositoIngresoId,
            id_producto: rit.id_producto,
            cantidad: rit.cantidad,
            cantidad_min: rit.minimo
          })
        });

        if (!stockResp.ok) {
          throw new Error(`No se pudo asociar el stock de ${rit.codigo} al depósito.`);
        }
      }

      this.mostrarAlerta("Materiales ingresados correctamente.", "success");
      this.elementosIngreso = [];
      this.cerrarModales();
      await this.cargarDatos();
    } catch (err: any) {
      console.error(err);
      this.mostrarAlerta(err.message || "Error al registrar los productos.", "danger");
    }
  }

  // Trasladar Material
  async trasladarMaterial(): Promise<void> {
    if (!this.origenTrasladoId || !this.destinoTrasladoId) {
      this.mostrarAlerta("Seleccione el depósito de origen y de destino.", "warning");
      return;
    }

    if (this.origenTrasladoId === this.destinoTrasladoId) {
      this.mostrarAlerta("El depósito de origen y de destino no pueden ser el mismo.", "warning");
      return;
    }

    // Fallback: si la lista temporal de elementos está vacía, intentar agregar los campos actuales
    if (this.elementosTraslado.length === 0) {
      if (this.codigoTraslado && this.cantidadTraslado > 0) {
        const codeUpper = this.codigoTraslado.trim().toUpperCase();
        const prod = this.productos.find(p => p.codigo_corto === codeUpper);
        if (!prod) {
          this.mostrarAlerta(`El producto con código "${codeUpper}" no existe en el catálogo.`, "warning");
          return;
        }
        this.elementosTraslado.push({
          id_producto: prod.id_producto,
          codigo: codeUpper,
          nombre: prod.descripcion,
          cantidad: this.cantidadTraslado
        });
      } else {
        this.mostrarAlerta("Debe agregar al menos un material a la lista de traslado.", "warning");
        return;
      }
    }

    try {
      const headers = this.getAuthHeaders();
      const userJson = localStorage.getItem("jba_user");
      let ci_p = "SYSTEM";
      if (userJson) {
        const user = JSON.parse(userJson);
        ci_p = user.ci_p || "SYSTEM";
      }

      // Procesar cada traslado de forma iterativa
      for (const item of this.elementosTraslado) {
        const transResp = await fetch("http://localhost:5188/api/traslados", {
          method: "POST",
          headers,
          body: JSON.stringify({
            id_dep_origen: this.origenTrasladoId,
            id_dep_destino: this.destinoTrasladoId,
            id_producto: item.id_producto,
            cantidad_tr: item.cantidad,
            ci_p: ci_p,
            fecha_tr: new Date().toISOString(),
            motivo: this.motivoTraslado.trim() || 'Traslado regular de inventario'
          })
        });

        if (!transResp.ok) {
          const errorText = await transResp.text();
          throw new Error(`Error en el traslado de ${item.codigo}: ${errorText || 'Error desconocido'}`);
        }
      }

      this.mostrarAlerta("Todos los traslados fueron procesados exitosamente.", "success");
      this.elementosTraslado = [];
      this.cerrarModales();
      await this.cargarDatos();
    } catch (err: any) {
      console.error(err);
      this.mostrarAlerta(err.message || "Error al procesar los traslados.", "danger");
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
