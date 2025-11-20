export interface AdminPedidoItemDTO {
    id: number;
    productoId: number;
    nombre: string;
    cantidad: number;
    nota: string | null;
    isExtra: boolean;

    facturado: number;
    pendiente: number;
}

export interface AdminPedidoDTO {
    id: number;
    mesaId: number;
    mesaNumero: number;
    meseroId: number;
    meseroNombre: string;

    total: number;
    createdAt: string;
    estadoPedido: string; // 'EN_PROCESO' | 'DESPACHADO' | 'COBRADO' | ...

    items: AdminPedidoItemDTO[];
    itemsCount: number;
    itemsPendientes: number;
    facturadoTotal: boolean;
    facturadoParcial: boolean;
}


export interface FacturarItemInput {
    pedidoItemId: number;
    cantidad: number;
}

export interface FacturarPedidoBody {
    metodoPago: 'EFECTIVO' | 'TRANSFERENCIA';
    propinaMonto?: number;
    items?: FacturarItemInput[];
}