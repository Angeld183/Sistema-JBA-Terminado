import { Routes } from '@angular/router';
import { LoginComponent, MenuComponent, EmpleadosComponent } from './app';
import { InscripcionComponent } from './inscripcion'; 
import { AlumnosInscritosComponent } from './alumnos-inscritos'; // Importamos el componente de Alumnos
import { SalonesComponent } from './salones'; 
import { GestionCajaComponent } from './gestion-caja'; 
import { AsistenciaComponent } from './asistencia'; 
import { InventarioComponent } from './inventario'; 

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { 
    path: 'menu', 
    component: MenuComponent, 
    children: [
      
      { path: 'empleados', component: EmpleadosComponent },
      
      
      { path: 'nueva-inscripcion', component: InscripcionComponent },

      
      { path: 'alumnos-inscritos', component: AlumnosInscritosComponent },

      
      { path: 'salones', component: SalonesComponent },

      
      { path: 'gestion-caja', component: GestionCajaComponent },

      
      { path: 'asistencia', component: AsistenciaComponent },

      { path: 'inventario', component: InventarioComponent }
    ]
  }
];