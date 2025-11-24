export interface ReporteVentasRow {
    facturaId: number;
    numero: string;
    fecha: string;
    hora: string;
    mesaNumero: number | null;
    meseroNombre: string | null;
    metodoPago: 'EFECTIVO' | 'TRANSFERENCIA';
    total: number;
    propina: number;
}

export interface ReporteVentasResponse {
    fechaDesde: string;
    fechaHasta: string;
    metodoPago?: string | null;
    totalFacturado: number;
    totalPropina: number;
    totalFacturas: number;
    ticketPromedio: number;
    rows: ReporteVentasRow[];
}
