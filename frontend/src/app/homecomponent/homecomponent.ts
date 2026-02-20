import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductosService, Producto } from '../services/productos';
import { CarritoService } from '../services/carrito';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-homecomponent',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './homecomponent.html',
  styleUrl: './homecomponent.scss'
})
export class HomeComponent implements OnInit {
  productos = inject(ProductosService);
  carrito = inject(CarritoService);
  auth = inject(AuthService);

  iphones = signal<Producto[]>([]);
  agregando = signal<number | null>(null);
  mensaje = signal('');

  ngOnInit() {
    this.productos.getAll().subscribe(data => this.iphones.set(data));
  }

  agregarAlCarrito(id: number) {
    if (!this.auth.isLoggedIn()) {
      this.mensaje.set('Inicia sesión para añadir al carrito');
      setTimeout(() => this.mensaje.set(''), 3000);
      return;
    }
    this.agregando.set(id);
    this.carrito.agregar(id).subscribe({
      next: () => {
        this.agregando.set(null);
        this.mensaje.set('¡Añadido al carrito!');
        setTimeout(() => this.mensaje.set(''), 3000);
      },
      error: () => this.agregando.set(null)
    });
  }
}
