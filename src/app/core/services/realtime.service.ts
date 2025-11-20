// src/app/core/services/realtime.service.ts
import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PedidoEventPayload, PedidoExtraPayload, RolSocket } from '../models/events.models';

@Injectable({
    providedIn: 'root',
})
export class RealtimeService {
    private socket: Socket | null = null;
    private conectado = false;

    private pedidoCreadoSubject = new Subject<PedidoEventPayload>();
    private pedidoActualizadoSubject = new Subject<PedidoEventPayload>();
    private pedidoExtraSubject = new Subject<PedidoExtraPayload>();
    private pedidoDespachadoSubject = new Subject<PedidoEventPayload>();

    // Observables públicos
    pedidoCreado$ = this.pedidoCreadoSubject.asObservable();
    pedidoActualizado$ = this.pedidoActualizadoSubject.asObservable();
    pedidoExtra$ = this.pedidoExtraSubject.asObservable();
    pedidoDespachado$ = this.pedidoDespachadoSubject.asObservable();

    constructor(private ngZone: NgZone) {}

    /**
     * Conecta el socket y se registra con el rol.
     */
    connect(rol: RolSocket, usuarioId?: number) {
        if (this.conectado) return;

        this.socket = io(environment.wsUrl, {
        transports: ['websocket'],
        });

        this.socket.on('connect', () => {
        this.conectado = true;
        console.log('[WS] conectado:', this.socket?.id);

        // Registrarse en el backend
        this.socket?.emit('register', { rol, usuarioId });
        });

        this.socket.on('disconnect', () => {
        this.conectado = false;
        console.log('[WS] desconectado');
        });

        // Eventos de dominio que emite el backend
        this.socket.on('pedido:creado', (payload: PedidoEventPayload) => {
        this.runInZone(() => this.pedidoCreadoSubject.next(payload));
        });

        this.socket.on('pedido:actualizado', (payload: PedidoEventPayload) => {
        this.runInZone(() => this.pedidoActualizadoSubject.next(payload));
        });

        this.socket.on('pedido:extra', (payload: PedidoExtraPayload) => {
        this.runInZone(() => this.pedidoExtraSubject.next(payload));
        });

        this.socket.on('pedido:despachado', (payload: PedidoEventPayload) => {
        this.runInZone(() => this.pedidoDespachadoSubject.next(payload));
        });
    }

    disconnect() {
        if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        this.conectado = false;
        }
    }

    private runInZone(fn: () => void) {
        this.ngZone.run(fn);
    }
}
