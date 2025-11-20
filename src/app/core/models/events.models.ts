export type RolSocket = 'ADMIN' | 'MESERO' | 'DESPACHADOR';

export interface PedidoEventPayload {
    id: number;
    mesaId: number;
    estado: string;
    total?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface PedidoExtraPayload {
    pedidoId: number;
    item: any;
}