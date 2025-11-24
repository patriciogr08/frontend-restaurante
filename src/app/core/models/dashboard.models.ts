export interface KpisDashboard {
    totalVentasDia: number;
    totalPedidosDia: number;
    pedidosEnProceso: number;
    pedidosDespachados: number;
    pedidosCobrados: number;
    pedidosCancelados: number;
    ticketPromedio: number;
    mesasOcupadas: number;
    mesasLibres: number;
    tiempoPromedioPreparacionMin: number | null;
}

export interface VentaPorHora {
  hora: string;
  total: number;
}

export interface TopProducto {
    productoId: number;
    nombre: string;
    cantidad: number;
}

export interface PedidoDemorado {
    id: number;
    mesaNumero: number;
    meseroNombre: string | null;
    minutosEnProceso: number;
    total: number;
}

export interface PedidoCobrado {
    id: number;
    mesaNumero: number;
    total: number;
    cobradoAt: string;
}

export interface MetodoPagoResumen {
    metodo: 'EFECTIVO' | 'TRANSFERENCIA';
    total: number;
}

export interface AdminDashboardResponse {
    fechaDesde: string;
    fechaHasta: string;
    kpis: KpisDashboard;
    ventasPorHora: VentaPorHora[];
    topProductos: TopProducto[];
    pedidosDemorados: PedidoDemorado[];
    ultimosCobrados: PedidoCobrado[];
    metodosPago: MetodoPagoResumen[];
    propinaTotal: number;
}
