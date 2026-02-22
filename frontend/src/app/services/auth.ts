import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  direccion?: string | null;
  foto?: string | null;
  rol: string;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:3000/api/auth';
  usuario = signal<Usuario | null>(this.getUsuario());

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string; usuario: Usuario }>(`${this.api}/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
        this.usuario.set(res.usuario);
      })
    );
  }

  registro(nombre: string, email: string, password: string) {
    return this.http.post(`${this.api}/register`, { nombre, email, password });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuario.set(null);
  }

  getUsuario(): Usuario | null {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  }

  isLoggedIn(): boolean { return !!localStorage.getItem('token'); }
  isAdmin(): boolean { return this.getUsuario()?.rol === 'admin'; }

  // ── Perfil ──────────────────────────────────────────
  getPerfil() {
    return this.http.get<Usuario>(`${this.api}/perfil`);
  }

  actualizarPerfil(datos: { nombre: string; email: string; telefono: string; direccion: string }) {
    return this.http.put<Usuario>(`${this.api}/perfil`, datos).pipe(
      tap(usuario => {
        localStorage.setItem('usuario', JSON.stringify(usuario));
        this.usuario.set(usuario);
      })
    );
  }

  subirFoto(file: File) {
    const fd = new FormData();
    fd.append('foto', file);
    return this.http.post<Usuario>(`${this.api}/perfil/foto`, fd).pipe(
      tap(usuario => {
        localStorage.setItem('usuario', JSON.stringify(usuario));
        this.usuario.set(usuario);
      })
    );
  }

  eliminarFoto() {
    return this.http.delete<{ mensaje: string }>(`${this.api}/perfil/foto`);
  }

  cambiarPassword(passwordActual: string, passwordNueva: string) {
    return this.http.put<{ mensaje: string }>(`${this.api}/perfil/password`, {
      passwordActual,
      passwordNueva
    });
  }
}
