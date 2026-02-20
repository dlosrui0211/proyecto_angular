import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CarritoService } from '../services/carrito';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carritocomponent.html',
  styleUrl: './carritocomponent.scss'
})
export class CarritoComponent implements OnInit {
  carrito = inject(CarritoService);
  auth = inject(AuthService);
  router = inject(Router);

  ngOnInit() {
    this.carrito.cargar();
  }

  eliminar(id: number) {
    this.carrito.eliminar(id).subscribe();
  }

  vaciar() {
    this.carrito.vaciar().subscribe();
  }

  confirmarPedido() {
    this.router.navigate(['/pago']);
  }
}
