import { Component, inject, signal, OnInit, ChangeDetectionStrategy, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Usuario } from '../services/auth';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule],
  templateUrl: './perfilcomponent.html',
  styleUrl: './perfilcomponent.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerfilComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  perfil = signal<Usuario | null>(null);
  cargando = signal(true);
  guardando = signal(false);
  mensaje = signal('');
  error = signal('');
  subiendoFoto = signal(false);

  // Campos editables
  nombre = '';
  email = '';
  telefono = '';
  direccion = '';

  // Cambio de contraseña
  mostrarPassword = signal(false);
  passwordActual = '';
  passwordNueva = '';
  passwordConfirm = '';
  errorPassword = signal('');
  exitoPassword = signal('');
  guardandoPassword = signal(false);

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.cargando.set(true);
    this.auth.getPerfil().subscribe({
      next: (usuario) => {
        this.perfil.set(usuario);
        this.rellenarCampos(usuario);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.router.navigate(['/login']);
      }
    });
  }

  private rellenarCampos(u: Usuario) {
    this.nombre = u.nombre;
    this.email = u.email;
    this.telefono = u.telefono || '';
    this.direccion = u.direccion || '';
  }

  getFotoUrl(): string | null {
    const foto = this.perfil()?.foto;
    return foto ? `http://localhost:3000${foto}` : null;
  }

  abrirSelectorFoto() {
    this.fileInput()?.nativeElement.click();
  }

  onFotoSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.subiendoFoto.set(true);
    this.auth.subirFoto(file).subscribe({
      next: (usuario) => {
        this.perfil.set(usuario);
        this.subiendoFoto.set(false);
        this.mensaje.set('Foto actualizada');
        this.limpiarMensaje();
      },
      error: () => {
        this.subiendoFoto.set(false);
        this.error.set('Error al subir la foto');
        this.limpiarMensaje();
      }
    });
    input.value = '';
  }

  eliminarFoto() {
    this.subiendoFoto.set(true);
    this.auth.eliminarFoto().subscribe({
      next: () => {
        const p = this.perfil();
        if (p) this.perfil.set({ ...p, foto: null });
        this.subiendoFoto.set(false);
        this.mensaje.set('Foto eliminada');
        this.limpiarMensaje();
      },
      error: () => {
        this.subiendoFoto.set(false);
        this.error.set('Error al eliminar la foto');
        this.limpiarMensaje();
      }
    });
  }

  guardarDatos() {
    if (!this.nombre.trim() || !this.email.trim()) {
      this.error.set('El nombre y email son obligatorios');
      this.limpiarMensaje();
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.mensaje.set('');

    this.auth.actualizarPerfil({
      nombre: this.nombre.trim(),
      email: this.email.trim(),
      telefono: this.telefono.trim(),
      direccion: this.direccion.trim()
    }).subscribe({
      next: (usuario) => {
        this.perfil.set(usuario);
        this.rellenarCampos(usuario);
        this.guardando.set(false);
        this.mensaje.set('Perfil actualizado correctamente');
        this.limpiarMensaje();
      },
      error: (err: any) => {
        this.guardando.set(false);
        this.error.set(err.error?.error || 'Error al actualizar el perfil');
        this.limpiarMensaje();
      }
    });
  }

  togglePassword() {
    this.mostrarPassword.update(v => !v);
    this.errorPassword.set('');
    this.exitoPassword.set('');
    this.passwordActual = '';
    this.passwordNueva = '';
    this.passwordConfirm = '';
  }

  cambiarPassword() {
    if (!this.passwordActual || !this.passwordNueva || !this.passwordConfirm) {
      this.errorPassword.set('Todos los campos son obligatorios');
      return;
    }
    if (this.passwordNueva.length < 6) {
      this.errorPassword.set('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (this.passwordNueva !== this.passwordConfirm) {
      this.errorPassword.set('Las contraseñas no coinciden');
      return;
    }

    this.guardandoPassword.set(true);
    this.errorPassword.set('');
    this.exitoPassword.set('');

    this.auth.cambiarPassword(this.passwordActual, this.passwordNueva).subscribe({
      next: () => {
        this.guardandoPassword.set(false);
        this.exitoPassword.set('Contraseña actualizada correctamente');
        this.passwordActual = '';
        this.passwordNueva = '';
        this.passwordConfirm = '';
        this.mostrarPassword.set(false);
      },
      error: (err: any) => {
        this.guardandoPassword.set(false);
        this.errorPassword.set(err.error?.error || 'Error al cambiar la contraseña');
      }
    });
  }

  cerrarSesion() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  private limpiarMensaje() {
    setTimeout(() => {
      this.mensaje.set('');
      this.error.set('');
    }, 4000);
  }
}
