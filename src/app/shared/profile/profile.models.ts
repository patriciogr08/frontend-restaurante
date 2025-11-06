export interface Profile {
    id: number;
    usuario: string;
    nombre?: string;
    telefono?: string;
    email?: string;
    avatarUrl?: string;
    rol?: string;
}

export interface UpdateProfileDto {
    nombre?: string;
    telefono?: string;
    email?: string;
}

export interface ChangePasswordDto {
    actual: string;
    nueva: string;
}
