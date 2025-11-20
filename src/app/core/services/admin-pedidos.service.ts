// src/app/core/services/admin-pedidos.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, Observable } from 'rxjs';
import { Estado } from 'src/app/pages/admin/pedidos/pedidos.page';
import { AdminPedidoDTO, FacturarPedidoBody } from '../models/facturar.models';

@Injectable({ providedIn: 'root' })
export class AdminPedidosService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiBaseUrl}/admin/pedidos`;

    listarPorEstado(estado: Estado): Observable<AdminPedidoDTO[]> {
        return this.http.get<AdminPedidoDTO[] | { data: AdminPedidoDTO[] }>(this.baseUrl, {
            params: { estado },
            }).pipe(
            map((resp) => {
                if (Array.isArray(resp)) return resp;
                return resp.data ?? [];
            })
        );
    }
    facturarPedido(pedidoId: number, body: {
        metodoPago: 'EFECTIVO' | 'TRANSFERENCIA';
        propinaMonto?: number;
        items?: { pedidoItemId: number; cantidad: number }[];
    }) {
        return this.http.post(
        `${this.baseUrl}/${pedidoId}/facturar`,
        body
        );
    }


    cancelarPedido(pedidoId: number) {
        return this.http.post<{ message: string }>(
            `${this.baseUrl}/${pedidoId}/cancelar`,
            {},
        );
    }
}
