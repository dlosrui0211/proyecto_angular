import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface PedidoItem {
  id: number;
  producto_id: number;
  nombre: string;
  imagen: string;
  almacenamiento: string;
  cantidad: number;
  precio: number;
}

export interface Pedido {
  id: number;
  usuario_id: number;
  usuario_nombre: string;
  usuario_email: string;
  usuario_telefono?: string;
  usuario_direccion?: string;
  total: number;
  estado: 'pendiente' | 'completado' | 'cancelado';
  created_at: string;
  num_items?: number;
  items?: PedidoItem[];
}

export interface PedidosResponse {
  pedidos: Pedido[];
  total: number;
  page: number;
  limit: number;
}

export interface PedidoStats {
  total_pedidos: number;
  pendientes: number;
  completados: number;
  cancelados: number;
  ingresos_totales: number;
}

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private api = 'http://localhost:3000/api/pedidos';

  constructor(private http: HttpClient) {}

  // ── Usuario: mis pedidos ──────────────────────────────
  misPedidos(page = 1, limit = 10) {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    return this.http.get<PedidosResponse>(`${this.api}/mis-pedidos`, { params });
  }

  miPedidoDetalle(id: number) {
    return this.http.get<Pedido>(`${this.api}/mis-pedidos/${id}`);
  }

  // ── Admin ─────────────────────────────────────────────
  getAll(page = 1, limit = 20, estado?: string) {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    if (estado) params = params.set('estado', estado);
    return this.http.get<PedidosResponse>(this.api, { params });
  }

  getById(id: number) {
    return this.http.get<Pedido>(`${this.api}/${id}`);
  }

  updateEstado(id: number, estado: string) {
    return this.http.put<Pedido>(`${this.api}/${id}`, { estado });
  }

  eliminar(id: number) {
    return this.http.delete<{ mensaje: string }>(`${this.api}/${id}`);
  }

  getStats() {
    return this.http.get<PedidoStats>(`${this.api}/stats`);
  }
}
