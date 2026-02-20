import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-resetpassword',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resetpasswordcomponent.html',
  styleUrl: './resetpasswordcomponent.scss'
})
export class ResetpasswordComponent implements OnInit {
  http = inject(HttpClient);
  router = inject(Router);
  route = inject(ActivatedRoute);

  token = '';
  password = '';
  confirmar = '';
  error = signal('');
  exito = signal('');
  cargando = signal(false);

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) this.router.navigate(['/login']);
  }

  resetear() {
    if (!this.password || !this.confirmar) {
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

    this.http.post('http://localhost:3000/api/email/reset', {
      token: this.token,
      password: this.password
    }).subscribe({
      next: () => {
        this.cargando.set(false);
        this.exito.set('¡Contraseña actualizada! Redirigiendo...');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.error?.error || 'Token inválido o expirado');
      }
    });
  }
}
