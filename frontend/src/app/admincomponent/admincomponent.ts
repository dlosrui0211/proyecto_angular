import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { PedidosService, Pedido, PedidoStats } from '../services/pedidos';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admincomponent.html',
  styleUrl: './admincomponent.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent implements OnInit {
  private auth = inject(AuthService);
  private pedidosService = inject(PedidosService);
  private router = inject(Router);

  // Estado
  pedidos = signal<Pedido[]>([]);
  stats = signal<PedidoStats | null>(null);
  pedidoDetalle = signal<Pedido | null>(null);
  cargando = signal(false);
  error = signal('');
  mensaje = signal('');

  // Filtros y paginación
  filtroEstado = signal('');
  paginaActual = signal(1);
  totalPedidos = signal(0);
  limite = 15;

  totalPaginas = computed(() => Math.ceil(this.totalPedidos() / this.limite) || 1);

  // Vista
  vistaDetalle = signal(false);

  ngOnInit() {
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    this.cargarStats();
    this.cargarPedidos();
  }

  cargarStats() {
    this.pedidosService.getStats().subscribe({
      next: s => this.stats.set(s),
      error: () => {}
    });
  }

  cargarPedidos() {
    this.cargando.set(true);
    this.error.set('');
    const estado = this.filtroEstado() || undefined;

    this.pedidosService.getAll(this.paginaActual(), this.limite, estado).subscribe({
      next: res => {
        this.pedidos.set(res.pedidos);
        this.totalPedidos.set(res.total);
        this.cargando.set(false);
      },
      error: (err: any) => {
        this.error.set(err.error?.error || 'Error cargando pedidos');
        this.cargando.set(false);
      }
    });
  }

  filtrar(estado: string) {
    this.filtroEstado.set(estado);
    this.paginaActual.set(1);
    this.cargarPedidos();
  }

  irPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.paginaActual.set(pagina);
    this.cargarPedidos();
  }

  verDetalle(id: number) {
    this.cargando.set(true);
    this.pedidosService.getById(id).subscribe({
      next: p => {
        this.pedidoDetalle.set(p);
        this.vistaDetalle.set(true);
        this.cargando.set(false);
      },
      error: (err: any) => {
        this.error.set(err.error?.error || 'Error cargando detalle');
        this.cargando.set(false);
      }
    });
  }

  volverLista() {
    this.vistaDetalle.set(false);
    this.pedidoDetalle.set(null);
  }

  cambiarEstado(id: number, estado: string) {
    this.pedidosService.updateEstado(id, estado).subscribe({
      next: updated => {
        // Actualizar en la lista
        this.pedidos.update(list =>
          list.map(p => p.id === id ? { ...p, estado: updated.estado } : p)
        );
        // Actualizar en detalle si está abierto
        const det = this.pedidoDetalle();
        if (det && det.id === id) {
          this.pedidoDetalle.set({ ...det, estado: updated.estado });
        }
        this.mostrarMensaje(`Pedido #${id} → ${estado}`);
        this.cargarStats();
      },
      error: (err: any) => {
        this.error.set(err.error?.error || 'Error actualizando estado');
      }
    });
  }

  eliminarPedido(id: number) {
    if (!confirm(`¿Seguro que quieres eliminar el pedido #${id}? Esta acción no se puede deshacer.`)) return;

    this.pedidosService.eliminar(id).subscribe({
      next: () => {
        this.pedidos.update(list => list.filter(p => p.id !== id));
        this.totalPedidos.update(t => t - 1);
        if (this.vistaDetalle()) this.volverLista();
        this.mostrarMensaje(`Pedido #${id} eliminado`);
        this.cargarStats();
      },
      error: (err: any) => {
        this.error.set(err.error?.error || 'Error eliminando pedido');
      }
    });
  }

  private mostrarMensaje(msg: string) {
    this.mensaje.set(msg);
    setTimeout(() => this.mensaje.set(''), 3000);
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}
