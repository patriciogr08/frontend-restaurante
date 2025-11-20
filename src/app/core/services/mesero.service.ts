// src/app/core/services/mesero.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  MesaResumen,
  Carrito,
  CarritoItem,
  PedidoResumen,
  PedidoDetalle,
  PedidoItem,
} from '../models/mesero.models';
import { Observable } from 'rxjs';

const API = `${environment.apiBaseUrl}/mesero`;

@Injectable({ providedIn: 'root' })
export class MeseroService {
    constructor(private http: HttpClient) {}

    // ===== MESAS / CARRITOS =====

    listMesas(): Observable<MesaResumen[]> {
        return this.http.get<MesaResumen[]>(`${API}/mesas`);
    }

    abrirMesa(mesaId: number) {
        return this.http.post<{ carritoId: number; mesaId: number }>(
        `${API}/mesas/${mesaId}/abrir`,
        {}
        );
    }

    getCarritoActivoByMesa(mesaId: number) {
        return this.http.get<Carrito>(`${API}/mesas/${mesaId}/carrito`);
    }

    getCarrito(carritoId: number) {
        return this.http.get<Carrito>(`${API}/carritos/${carritoId}`);
    }

    addCarritoItem(
        carritoId: number,
        payload: {
        productoId: number;
        cantidad: number;
        notas?: string;
        tieneDescuento?: boolean;
        descuentoPorcentaje?: number;
        descuentoValor?: number;
        }
    ) {
        return this.http.post<CarritoItem>(
        `${API}/carritos/${carritoId}/items`,
        payload
        );
    }

    editCarritoItem(
        carritoId: number,
        itemId: number,
        payload: Partial<{
        cantidad: number;
        notas: string | null;
        tieneDescuento: boolean;
        descuentoPorcentaje: number;
        descuentoValor: number;
        }>
    ) {
        return this.http.put<CarritoItem>(
        `${API}/carritos/${carritoId}/items/${itemId}`,
        payload
        );
    }

    removeCarritoItem(carritoId: number, itemId: number) {
        return this.http.delete<{ ok: boolean }>(
        `${API}/carritos/${carritoId}/items/${itemId}`
        );
    }

    enviarACocina(carritoId: number) {
        return this.http.post<any>(
        `${API}/carritos/${carritoId}/enviar-cocina`,
        {}
        );
    }

    limpiarCarrito(carritoId: number) {
        return this.http.post<{ ok: boolean }>(`${API}/carritos/${carritoId}/limpiar`, {});
    }


    // ===== PEDIDOS (MESERO) =====

    listMisPedidos(params?: { estado?: 'EN_PROCESO' | 'DESPACHADO' | 'TODOS' }) {
        const qs = new URLSearchParams();
        if (params?.estado && params.estado !== 'TODOS') {
        qs.set('estado', params.estado);
        }

        const url = `${API}/pedidos${qs.toString() ? '?' + qs.toString() : ''}`;
        return this.http.get<PedidoResumen[]>(url);
    }

    getPedido(pedidoId: number) {
        return this.http.get<PedidoDetalle>(`${API}/pedidos/${pedidoId}`);
    }

    addPedidoItem(
        pedidoId: number,
        payload: {
        productoId: number;
        cantidad: number;
        notas?: string;
        isExtra?: boolean;
        tieneDescuento?: boolean;
        descuentoPorcentaje?: number;
        descuentoValor?: number;
        }
    ) {
        return this.http.post<PedidoItem>(
        `${API}/pedidos/${pedidoId}/items`,
        payload
        );
    }

    editPedidoItem(
        pedidoId: number,
        itemId: number,
        payload: Partial<{
        cantidad: number;
        notas: string | null;
        isExtra: boolean;
        tieneDescuento: boolean;
        descuentoPorcentaje: number;
        descuentoValor: number;
        }>
    ) {
        return this.http.put<PedidoItem>(
        `${API}/pedidos/${pedidoId}/items/${itemId}`,
        payload
        );
    }

    removePedidoItem(pedidoId: number, itemId: number) {
        return this.http.delete<{ ok: boolean }>(`${API}/pedidos/${pedidoId}/items/${itemId}`);
    }

    transferirPedido(pedidoId: number, nuevoMeseroId: number) {
        return this.http.post<{ id: number; meseroId: number }>(
            `${API}/pedidos/${pedidoId}/transferir`,
            { meseroId: nuevoMeseroId }
        );
    }
}
