import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosService, Producto } from '../services/productos';
import { CarritoService } from '../services/carrito';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-ihponedetallescomponent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ihponedetallescomponent.html',
  styleUrl: './ihponedetallescomponent.scss'
})
export class IhponedetallesComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  productosService = inject(ProductosService);
  carrito = inject(CarritoService);
  auth = inject(AuthService);

  iphone = signal<Producto | null>(null);
  agregando = signal(false);
  mensaje = signal('');

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productosService.getById(id).subscribe({
      next: (data) => this.iphone.set(data),
      error: () => this.router.navigate(['/iphones'])
    });
  }

  agregarAlCarrito() {
    if (!this.auth.isLoggedIn()) {
      this.mensaje.set('Inicia sesión para añadir al carrito');
      setTimeout(() => this.mensaje.set(''), 3000);
      return;
    }
    this.agregando.set(true);
    this.carrito.agregar(this.iphone()!.id).subscribe({
      next: () => {
        this.agregando.set(false);
        this.mensaje.set('¡Añadido al carrito!');
        setTimeout(() => this.mensaje.set(''), 3000);
      },
      error: () => this.agregando.set(false)
    });
  }

  volver() {
    this.router.navigate(['/iphones']);
  }
}
