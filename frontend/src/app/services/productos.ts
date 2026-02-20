import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  stock: number;
  almacenamiento: string;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private api = 'http://localhost:3000/api/productos';
  constructor(private http: HttpClient) {}

  getAll()                               { return this.http.get<Producto[]>(this.api); }
  getById(id: number)                    { return this.http.get<Producto>(`${this.api}/${id}`); }
  create(p: Partial<Producto>)           { return this.http.post(this.api, p); }
  update(id: number, p: Partial<Producto>) { return this.http.put(`${this.api}/${id}`, p); }
  delete(id: number)                     { return this.http.delete(`${this.api}/${id}`); }
}
