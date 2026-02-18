import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

export interface ItemCarrito {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
  almacenamiento: string;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private api = 'http://localhost:3000/api/carrito';
  items = signal<ItemCarrito[]>([]);
  abierto = signal(false);

  total    = computed(() => this.items().reduce((s, i) => s + i.precio * i.cantidad, 0));
  cantidad = computed(() => this.items().reduce((s, i) => s + i.cantidad, 0));

  constructor(private http: HttpClient) {}

  cargar() {
    const token = localStorage.getItem('token');
    if (!token) { this.items.set([]); return; }
    this.http.get<ItemCarrito[]>(this.api).subscribe(i => this.items.set(i));
  }

  agregar(producto_id: number) {
    return this.http.post(this.api, { producto_id, cantidad: 1 }).pipe(
      tap(() => this.cargar())
    );
  }

  eliminar(id: number) {
    return this.http.delete(`${this.api}/${id}`).pipe(tap(() => this.cargar()));
  }

  vaciar() {
    return this.http.delete(this.api).pipe(tap(() => this.items.set([])));
  }

  toggleCarrito() { this.abierto.update(v => !v); }
}
