import { Estado } from "./estado.models";

export type Rol = 'MESERO'|'DESPACHADOR';

export interface Usuario {
    id: number;
    nombre: string;
    usuario: string;
    email: string|null;
    telefono: string|null;
    avatarUrl: string|null;
    rol: Rol;
    estado: Estado;
    createdAt: string;
    updatedAt?: string;
}