// src/app/core/models/mesero.models.ts

import { Producto } from "./products.models";

export type OcupacionMesa = 'LIBRE' | 'OCUPADA' | string;

export interface MesaResumen {
    id: number;
    numero: string;
    capacidad: number;
    ocupacion: OcupacionMesa;
    }

/** Item dentro del carrito (antes de crear Pedido) */
export interface CarritoItem {
    id: number;
    carritoId: number;
    productoId: number;
    precioUnitario: number;
    cantidad: number;
    notas: string | null;
    tieneDescuento: boolean;
    descuentoPorcentaje: number;
    descuentoValor: number;
    producto?: Producto;
}

/** Carrito ligado a mesa y mesero */
export interface Carrito {
    id: number;
    mesaId: number;
    meseroId: number;
    estado: string; // ACTIVO  / CANCELADO
    items?: CarritoItem[];
}

/** Item de un pedido (ya en cocina / en proceso) */
export interface PedidoItem {
    id: number;
    pedidoId: number;
    productoId: number;
    precioUnitario: number;
    cantidad: number;
    notas: string | null;
    isExtra: boolean;
    tieneDescuento: boolean;
    descuentoPorcentaje: number;
    descuentoValor: number;
    producto?: Producto; 
}

/** Vista resumida de pedido para listados */
export interface PedidoResumen {
    id: number;
    mesaId: number;
    subtotal: number;
    ivaMonto: number;
    total: number;
    createdAt: string;
    estado: string;   // 👈 nuevo
}

/** Detalle completo del pedido para el mesero */
export interface PedidoDetalle extends PedidoResumen {
    items: PedidoItem[];
}


export interface MesaResumen {
    id: number;
    numero: string;
    capacidad: number;
    ocupacion: string;

    carritoId: number | null;
    pedidoId: number | null;

    puedeAbrir: boolean;
    puedeEntrarCarrito: boolean;
    tienePedido: boolean;
}
