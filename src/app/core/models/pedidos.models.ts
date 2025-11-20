export interface PedidoItem {
    id: number;
    nombre: string;
    cantidad: number;
    isExtra: boolean;
    nota?: string | null;
}

export interface PedidoDespacho {
    id: number;
    mesaId: number;
    mesaNumero: string;   // ahora usamos esto para mostrar
    estado: 'EN_PROCESO' | 'DESPACHADO';
    creadoEn: string;
    tiempoMaxMinutos?: number;
    total: number;
    items: PedidoItem[];
}


export interface ResumenProductoItem {
    id: number;           // id del item (el que viene en tu JSON)
    cantidad: number;
    nota?: string;
    isExtra: boolean;
}

export interface ResumenProducto {
  nombre: string;           // o productoNombre
  cantidadTotal: number;
  items: ResumenProductoItem[];
}



export interface AdminPedidoItemDetalle {
    id: number;
    nombre: string;
    cantidad: number;
    nota?: string | null;
    isExtra?: boolean
}

export interface AdminPedidoResumen {
    id: number;
    mesaNumero: number;
    total: number;
    itemsCount: number; // cantidad de items
    createdAt: string; // texto "hace 5 min" o fecha formateada
    estadoPedido: string;
    items: AdminPedidoItemDetalle[];
}

