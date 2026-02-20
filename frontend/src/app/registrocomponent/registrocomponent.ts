import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrocomponent.html',
  styleUrl: './registrocomponent.scss'
})
export class RegistroComponent {
  auth = inject(AuthService);
  router = inject(Router);

  nombre = '';
  email = '';
  password = '';
  confirmar = '';
  error = signal('');
  cargando = signal(false);

  registrar() {
    if (!this.nombre || !this.email || !this.password || !this.confirmar) {
      this.error.set('Rellena todos los campos');
      return;
    }
    if (this.password !== this.confirmar) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    this.auth.register(this.nombre, this.email, this.password).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.error?.error || 'Error al registrarse');
      }
    });
  }
}
