import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { PedidosService, Pedido } from '../services/pedidos';

@Component({
  selector: 'app-pedidos',
  imports: [CommonModule],
  templateUrl: './pedidoscomponent.html',
  styleUrl: './pedidoscomponent.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PedidosComponent implements OnInit {
  private auth = inject(AuthService);
  private pedidosService = inject(PedidosService);
  private router = inject(Router);

  pedidos = signal<Pedido[]>([]);
  pedidoDetalle = signal<Pedido | null>(null);
  cargando = signal(false);
  error = signal('');

  paginaActual = signal(1);
  totalPedidos = signal(0);
  limite = 10;

  totalPaginas = computed(() => Math.ceil(this.totalPedidos() / this.limite) || 1);
  vistaDetalle = signal(false);

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando.set(true);
    this.error.set('');

    this.pedidosService.misPedidos(this.paginaActual(), this.limite).subscribe({
      next: res => {
        this.pedidos.set(res.pedidos);
        this.totalPedidos.set(res.total);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        const e = err as { error?: { error?: string } };
        this.error.set(e.error?.error || 'Error cargando pedidos');
        this.cargando.set(false);
      }
    });
  }

  irPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.paginaActual.set(pagina);
    this.cargarPedidos();
  }

  verDetalle(id: number) {
    this.cargando.set(true);
    this.pedidosService.miPedidoDetalle(id).subscribe({
      next: p => {
        this.pedidoDetalle.set(p);
        this.vistaDetalle.set(true);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        const e = err as { error?: { error?: string } };
        this.error.set(e.error?.error || 'Error cargando detalle');
        this.cargando.set(false);
      }
    });
  }

  volverLista() {
    this.vistaDetalle.set(false);
    this.pedidoDetalle.set(null);
  }

  getEstadoLabel(estado: string): string {
    const map: Record<string, string> = {
      pendiente: 'Pendiente',
      completado: 'Completado',
      cancelado: 'Cancelado'
    };
    return map[estado] || estado;
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  formatFechaCorta(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}
