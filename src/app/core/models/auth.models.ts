export interface User { 
    id: number; 
    usuario: string;
    nombre?: string; 
    correo: string; 
    rol?: string; 
}

export interface LoginResponse { 
    token: string; 
    user: User; 
}