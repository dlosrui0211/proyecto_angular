import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';
import { CarritoService } from '../services/carrito';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbarcomponent.html',
  styleUrl: './navbarcomponent.scss'
})
export class NavbarComponent {
  auth = inject(AuthService);
  carrito = inject(CarritoService);
  router = inject(Router);
  menuAbierto = signal(false);


  toggleMenu() { this.menuAbierto.update(v => !v); }
  cerrarMenu() { this.menuAbierto.set(false); }

  logout() {
    this.auth.logout();
    this.menuAbierto.set(false);
    this.router.navigate(['/']);
  }
}
