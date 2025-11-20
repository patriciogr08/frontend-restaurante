// src/app/pages/mesero/mesas/mesas.page.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { MeseroService } from '../../../core/services/mesero.service';
import { MesaResumen } from '../../../core/models/mesero.models';
import { firstValueFrom } from 'rxjs';

import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
    standalone: true,
    selector: 'app-mesas',
    templateUrl: './mesas.page.html',
    styleUrls: ['./mesas.page.scss'],
    imports: [CommonModule, IonicModule],
})
export class MesasPage implements OnInit, OnDestroy {
  // Inyección moderna
    private meseroSrv   = inject(MeseroService);
    private loadingCtrl = inject(LoadingController);
    private toastCtrl   = inject(ToastController);
    private router      = inject(Router);
    private authSrv     = inject(AuthService);

    mesas: MesaResumen[] = [];
    loading = false;

    private socket?: Socket;

    async ngOnInit() {
        this.initSocket();
        await this.cargarMesas();
    }

    ngOnDestroy(): void {
        if (this.socket && this.socket.connected) {
        this.socket.disconnect();
        }
    }

    // ================== SOCKET.IO ==================

    private initSocket() {
        const user = this.authSrv.currentUser;
        if (!user) {
        console.warn('[WS][MESERO-MESAS] No hay usuario logueado, no se inicia socket');
        return;
        }

        console.log('[WS][MESERO-MESAS] intentando conectar a', environment.wsUrl);

        this.socket = io(environment.wsUrl, {
        transports: ['websocket'],
        });

        this.socket.on('connect', () => {
        console.log('[WS][MESERO-MESAS] conectado ✅, id =', this.socket?.id);

        this.socket!.emit('register', {
            rol: 'MESERO',
            usuarioId: user.id,
        });

        console.log('[WS][MESERO-MESAS] register enviado', { rol: 'MESERO', usuarioId: user.id });
        });

        this.socket.on('disconnect', (reason) => {
        console.log('[WS][MESERO-MESAS] desconectado ❌', reason);
        });

        this.socket.on('connect_error', (err) => {
        console.error('[WS][MESERO-MESAS] connect_error 🔥', err.message);
        });

        // Eventos que afectan el estado de mesas/pedidos
        const refrescar = (eventName: string, payload: any) => {
        console.log(`[WS][MESERO-MESAS] ${eventName}`, payload);
        this.cargarMesas();
        };

        this.socket.on('pedido:creado',     (p: any) => refrescar('pedido:creado', p));
        this.socket.on('pedido:actualizado',(p: any) => refrescar('pedido:actualizado', p));
        this.socket.on('pedido:despachado', (p: any) => refrescar('pedido:despachado', p));
        this.socket.on('mesa:actualizada',  (m: any) => refrescar('mesa:actualizada', m));
    }

    // ================== CARGA DE MESAS ==================

    async cargarMesas(event?: any) {
        this.loading = true;
        try {
            this.mesas = await firstValueFrom(this.meseroSrv.listMesas());
        } catch {
            const t = await this.toastCtrl.create({
                message: 'Error al cargar mesas',
                duration: 2000,
                color: 'danger',
            });
            t.present();
        } finally {
            this.loading = false;
            event?.target?.complete?.();
        }
    }

    // ================== REGLAS DE NEGOCIO ==================
    // Ahora usamos los flags que devuelve el backend

    puedeAbrir(mesa: MesaResumen) {
        return mesa.puedeAbrir;             // no tiene carrito ni pedido
    }

    puedeEntrar(mesa: MesaResumen) {
        return mesa.puedeEntrarCarrito;     // tiene carrito ACTIVO del mesero
    }

    tienePedido(mesa: MesaResumen) {
        return mesa.tienePedido;            // tiene pedido EN_PROCESO
    }

    // ================== ACCIONES ==================
    async onAbrirMesa(mesa: MesaResumen) {
    if (!this.puedeAbrir(mesa)) {
        const t = await this.toastCtrl.create({
        message: 'La mesa no está disponible para abrir',
        duration: 2000,
        color: 'warning',
        });
        t.present();
        return;
    }

    const loader = await this.loadingCtrl.create({ message: 'Abriendo mesa...' });
    await loader.present();

    try {
        const resp = await firstValueFrom(this.meseroSrv.abrirMesa(mesa.id));
        await loader.dismiss();

        // 👇 ACTUALIZAR ESTADO LOCAL
        // si tienes un enum o string de estado, pon aquí el correcto:
        mesa.ocupacion='OCUPADA'
        mesa.puedeAbrir=false
        mesa.puedeEntrarCarrito = true;        // o 'OCUPADA', 'EN_PROCESO', etc.
        (mesa as any).carritoId = resp.carritoId; // si lo manejas en el frontend
        // si tu botón depende de otra bandera, márcala aquí:
        // mesa.tienePedido = true;  // por ejemplo

        const t = await this.toastCtrl.create({
        message: `Mesa ${mesa.numero} abierta`,
        duration: 1500,
        color: 'success',
        });
        t.present();

        this.router.navigate(['/mesero/pedidos'], {
        queryParams: { mesaId: mesa.id, carritoId: resp.carritoId },
        });
    } catch (err: any) {
        await loader.dismiss();
        const msg = err?.error?.message || 'No se pudo abrir la mesa';
        const t = await this.toastCtrl.create({
        message: msg,
        duration: 2000,
        color: 'danger',
        });
        t.present();
    }
    }


    async onEntrarMesa(mesa: MesaResumen) {
        if (!this.puedeEntrar(mesa)) {
            const t = await this.toastCtrl.create({
                message: 'No hay carrito activo para esta mesa',
                duration: 2000,
                color: 'warning',
            });
            t.present();
        return;
        }

        const loader = await this.loadingCtrl.create({ message: 'Cargando mesa...' });
        await loader.present();
        try {
            // Si ya tienes carritoId en MesaResumen, podrías usarlo directo:
            // const carritoId = mesa.carritoId!;
            // Pero mantengo tu lógica actual por compatibilidad:
            const carrito = await firstValueFrom(
                this.meseroSrv.getCarritoActivoByMesa(mesa.id)
            );
            await loader.dismiss();

            this.router.navigate(['/mesero/pedidos'], {
                queryParams: { mesaId: mesa.id, carritoId: carrito.id },
            });
        } catch (err: any) {
            await loader.dismiss();
            const msg = err?.error?.message || 'No hay carrito activo para esta mesa';
            const t = await this.toastCtrl.create({
                message: msg,
                duration: 2000,
                color: 'warning',
            });
            t.present();
        }
    }
}
