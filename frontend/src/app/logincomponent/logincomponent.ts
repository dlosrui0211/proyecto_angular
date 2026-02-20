import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './logincomponent.html',
  styleUrl: './logincomponent.scss'
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);
  http = inject(HttpClient);


  email = '';
  password = '';
  error = signal('');
  cargando = signal(false);
  mostrarRecuperar = false;
  emailRecuperar = '';
  mensajeRecuperar = signal('');

  recuperarPassword() {
    if (!this.emailRecuperar) {
      this.mensajeRecuperar.set('Introduce tu email');
      return;
    }
    this.http.post('http://localhost:3000/api/email/recuperar', { email: this.emailRecuperar })
      .subscribe({
        next: () => this.mensajeRecuperar.set('Si el email existe, recibirás un enlace en breve.'),
        error: () => this.mensajeRecuperar.set('Error al enviar el email')
      });
  }

  login() {
    if (!this.email || !this.password) {
      this.error.set('Por favor rellena todos los campos');
      return;
    }
    this.cargando.set(true);
    this.error.set('');

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.error?.error || 'Error al iniciar sesión');
      }
    });
  }
}
