export type Ocupacion = 'LIBRE'|'OCUPADA'|'EN_COBRO';

export interface Mesa {
    id: number;
    numero: number;
    capacidad: number;
    ocupacion: Ocupacion;
    createdAt: string;
    updatedAt?: string|null;
    deletedAt?: string|null; // <- para soft-delete
}