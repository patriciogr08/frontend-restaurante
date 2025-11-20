// src/app/core/services/despachador-pedidos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, tap } from 'rxjs';
import { PedidoDespacho } from '../models/pedidos.models';

@Injectable({ providedIn: 'root' })
export class DespachadorPedidosService {
    private api = `${environment.apiBaseUrl}/despachador/pedidos`;

    pedidosEnProceso$ = new BehaviorSubject<PedidoDespacho[]>([]);
    pedidosDespachados$ = new BehaviorSubject<PedidoDespacho[]>([]);

    constructor(private http: HttpClient) {}

    cargarPedidos() {
        return this.http.get<{
        enProceso: PedidoDespacho[];
        despachados: PedidoDespacho[];
        }>(this.api).pipe(
        tap(resp => {
            this.pedidosEnProceso$.next(resp.enProceso);
            this.pedidosDespachados$.next(resp.despachados);
        })
        );
    }

    marcarComoDespachado(id: number) {
        return this.http.post<PedidoDespacho>(`${this.api}/${id}/despachar`, {})
        .pipe(
            tap(pedidoActualizado => {
            const enProc = this.pedidosEnProceso$.value.filter(p => p.id !== id);
            const desp = [pedidoActualizado, ...this.pedidosDespachados$.value];

            this.pedidosEnProceso$.next(enProc);
            this.pedidosDespachados$.next(desp);
            })
        );
    }
}
