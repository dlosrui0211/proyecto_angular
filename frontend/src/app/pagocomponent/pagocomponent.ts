import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CarritoService } from '../services/carrito';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagocomponent.html',
  styleUrl: './pagocomponent.scss'
})
export class PagoComponent implements OnInit {
  carrito = inject(CarritoService);
  auth = inject(AuthService);
  http = inject(HttpClient);
  router = inject(Router);

  paso = signal(1);
  cargando = signal(false);
  error = signal('');

  // Datos envío
  nombre = '';
  apellidos = '';
  direccion = '';
  ciudad = '';
  codigoPostal = '';
  telefono = '';

  // Datos pago simulado
  titular = '';
  numeroTarjeta = '';
  caducidad = '';
  cvv = '';

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.carrito.items().length === 0) {
      this.router.navigate(['/carrito']);
    }
  }

  siguientePaso() {
    if (this.paso() === 1) {
      if (!this.nombre || !this.apellidos || !this.direccion || !this.ciudad || !this.codigoPostal) {
        this.error.set('Rellena todos los campos de envío');
        return;
      }
    }
    this.error.set('');
    this.paso.update(p => p + 1);
  }

  anteriorPaso() {
    this.error.set('');
    this.paso.update(p => p - 1);
  }

  confirmarPago() {
    if (!this.titular || !this.numeroTarjeta || !this.caducidad || !this.cvv) {
      this.error.set('Rellena todos los datos de pago');
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    const usuario = this.auth.getUsuario();
    const items = this.carrito.items();
    const total = this.carrito.total().toFixed(2);

    // Simular procesamiento de pago
    setTimeout(() => {
      // Enviar email de confirmación
      this.http.post('http://localhost:3000/api/email/confirmar-pedido', {
        email: usuario.email || '',
        nombre: usuario.nombre,
        items: items,
        total: total
      }).subscribe({
        next: () => {
          this.carrito.vaciar().subscribe();
          this.cargando.set(false);
          this.paso.set(3);
        },
        error: () => {
          this.carrito.vaciar().subscribe();
          this.cargando.set(false);
          this.paso.set(3);
        }
      });
    }, 2000);
  }

  formatearTarjeta(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    this.numeroTarjeta = value.substring(0, 19);
  }

  formatearCaducidad(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
    this.caducidad = value.substring(0, 5);
  }

  irAlInicio() {
    this.router.navigate(['/']);
  }
}
