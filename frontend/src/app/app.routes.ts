import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./homecomponent/homecomponent').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./logincomponent/logincomponent').then(m => m.LoginComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./resetpasswordcomponent/resetpasswordcomponent').then(m => m.ResetpasswordComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./registrocomponent/registrocomponent').then(m => m.RegistroComponent)
  },
  {
    path: 'iphones',
    loadComponent: () => import('./iphonescomponent/iphonescomponent').then(m => m.IphonesComponent)
  },
  {
    path: 'iphones/:id',
    loadComponent: () => import('./ihponedetallescomponent/ihponedetallescomponent').then(m => m.IhponedetallesComponent)
  },
  {
    path: 'carrito',
    loadComponent: () => import('./carritocomponent/carritocomponent').then(m => m.CarritoComponent)
  },
  {
    path: 'pago',
    loadComponent: () => import('./pagocomponent/pagocomponent').then(m => m.PagoComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
