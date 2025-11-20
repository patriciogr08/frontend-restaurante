// src/app/core/services/ws.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { User } from '../models/auth.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WsService {
    private socket?: Socket;

    connectIfNeeded(user: User) {
        if (this.socket && this.socket.connected) {
        console.log('[WS] ya conectado, id =', this.socket.id);
        return;
        }

        console.log('[WS] intentando conectar a', environment.wsUrl);

        this.socket = io(environment.wsUrl, {
        transports: ['websocket'],
        });

        this.socket.on('connect', () => {
        console.log('[WS] conectado ✅, id =', this.socket?.id);

        this.socket!.emit('register', {
            rol: user.rol,
            usuarioId: user.id,
        });

        console.log('[WS] register enviado', { rol: user.rol, usuarioId: user.id });
        });

        this.socket.on('disconnect', (reason) => {
        console.log('[WS] desconectado ❌', reason);
        });

        this.socket.on('connect_error', (err) => {
        console.error('[WS] connect_error 🔥', err.message);
        });
    }

    on<T>(event: string) {
        return new Observable<T>(observer => {
        if (!this.socket) return;

        const handler = (data: T) => observer.next(data);
        this.socket.on(event, handler);

        return () => {
            this.socket?.off(event, handler);
        };
        });
    }

    emit(event: string, payload?: any) {
        this.socket?.emit(event, payload);
    }
}
