import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Rol, Usuario } from '../models/users.models';
import { Estado } from '../models/estado.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);

  list() {
    return this.http.get<Usuario[]>('/usuarios');
  }
  create(payload: { nombre:string; usuario:string; password:string; rol:Rol; email?:string|null; telefono?:string|null; }) {
    return this.http.post<Usuario>('/usuarios', payload);
  }
  update(id: number, payload: Partial<{ nombre:string; rol:Rol; email:string|null; telefono:string|null; password:string }>) {
    return this.http.patch<Usuario>(`/usuarios/${id}`, payload);
  }
  setEstado(id: number, estado: Estado) {
    return this.http.patch<{ id:number; estado:Estado }>(`/usuarios/${id}/estado`, { estado });
  }
}
