// src/app/pages/despachador/pedidos/pedidos.page.ts
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { PedidoDespacho, ResumenProducto } from 'src/app/core/models/pedidos.models';
import { DespachadorPedidosService } from 'src/app/core/services/despachador-pedidos.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { environment } from 'src/environments/environment';
import { io, Socket } from 'socket.io-client';

@Component({
  standalone: true,
  selector: 'app-despachador-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  imports: [IonicModule, CommonModule, RouterModule]
})
export class DespachadorPedidosPage implements OnInit, OnDestroy {

    // inyección con inject()
    private pedidosSrv = inject(DespachadorPedidosService);
    private toastCtrl  = inject(ToastController);
    private authSrv    = inject(AuthService);

    activeTab: 'proceso' | 'despachados' = 'proceso';

    pedidosEnProceso: PedidoDespacho[] = [];
    pedidosDespachados: PedidoDespacho[] = [];
    resumenProductos: ResumenProducto[] = [];

    now = Date.now();
    private timerId: any;

    pedidoSeleccionado: PedidoDespacho | null = null;

    // socket
    private socket?: Socket;

    ngOnInit(): void {
        // 1) Timer global para recalcular tiempos
        this.timerId = setInterval(() => {
            this.now = Date.now();
        }, 1000);

        // 2) Conectar WebSocket
        this.initSocket();

        // 3) Cargar pedidos iniciales
        this.cargarPedidosInicial();
        
        // 4) Suscribirse a cambios en el servicio (BehaviorSubjects)
        this.pedidosSrv.pedidosEnProceso$.subscribe(ped => {
            this.pedidosEnProceso = ped;
            this.recalcularResumen();
            this.autoSeleccionarPedido();
        });

        this.pedidosSrv.pedidosDespachados$.subscribe(ped => {
            this.pedidosDespachados = ped;
        });
    }

    ngOnDestroy(): void {
        if (this.timerId) clearInterval(this.timerId);
        if (this.socket && this.socket.connected) {
            this.socket.disconnect();
        }
    }

    // ================== SOCKET.IO ==================

    private initSocket() {
        const user = this.authSrv.currentUser; // ajusta según tu AuthService

        if (!user) {
            console.warn('[WS] No hay usuario logueado, no se inicia socket');
            return;
        }

        console.log('[WS] intentando conectar a', environment.wsUrl);

        this.socket = io(environment.wsUrl, {
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('[WS] conectado ✅, id =', this.socket?.id);

            // IMPORTANTE: coincide con tu backend (evento "register")
            this.socket!.emit('register', {
                rol: 'DESPACHADOR', // o user.rol si ya viene del backend
                usuarioId: user.id,
            });

            console.log('[WS] register enviado', { rol: 'DESPACHADOR', usuarioId: user.id });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('[WS] desconectado ❌', reason);
        });

        this.socket.on('connect_error', (err) => {
            console.error('[WS] connect_error 🔥', err.message);
        });

        // Eventos de negocio:
        this.socket.on('pedido:creado', (payload: any) => {
            console.log('[WS] pedido:creado', payload);
            this.refrescarDesdeSocket();
        });

        this.socket.on('pedido:actualizado', (payload: any) => {
            console.log('[WS] pedido:actualizado', payload);
            this.refrescarDesdeSocket();
        });

        this.socket.on('pedido:despachado', (payload: any) => {
            console.log('[WS] pedido:despachado', payload);
            this.refrescarDesdeSocket();
        });

        this.socket.on('pedido:facturado', (payload: any) => {
            console.log('[WS][ADMIN] pedido:facturado', payload);
            this.refrescarDesdeSocket();
        });

        this.socket.on('pedido:cobrado', (payload: any) => {
            console.log('[WS][ADMIN] pedido:cobrado', payload);
            this.refrescarDesdeSocket();
        });

        
    }

    /**
     * Recarga los pedidos desde el backend cuando llega un evento WS.
     */
    private refrescarDesdeSocket() {
        this.pedidosSrv.cargarPedidos().subscribe({
            next: () => {
                // Los BehaviorSubject del servicio disparan las suscripciones del ngOnInit
                console.log('[WS] pedidos recargados desde evento');
            },
            error: (err) => {
                console.error('[WS] error recargando pedidos', err);
                this.showToast('Error actualizando pedidos', 'danger');
            }
        });
    }

    /**
     * Carga inicial (al entrar a la página).
     */
    private cargarPedidosInicial() {
        this.pedidosSrv.cargarPedidos().subscribe({
            next: () => {
                this.pedidosEnProceso = this.pedidosSrv.pedidosEnProceso$.value;
                this.pedidosDespachados = this.pedidosSrv.pedidosDespachados$.value;

                this.recalcularResumen();
                this.autoSeleccionarPedido();
            },
            error: () => {
                this.showToast('Error cargando pedidos', 'danger');
            }
        });
    }

    // ================== TABS Y SELECCIÓN ==================

    changeTab(tab: 'proceso' | 'despachados') {
        this.activeTab = tab;
    }

    seleccionarPedido(p: PedidoDespacho) {
        if (this.pedidoSeleccionado?.id === p.id) {
            this.pedidoSeleccionado = null;
        } else {
            this.pedidoSeleccionado = p;
        }
    }

    private autoSeleccionarPedido() {
        this.pedidoSeleccionado = null;
    }

    // ================== RESUMEN ==================
    private recalcularResumen() {
        const map = new Map<string, ResumenProducto>();

        for (const p of this.pedidosEnProceso) {
            for (const item of p.items) {

            // 👇 CLAVE DE AGRUPACIÓN
            // si tienes item.productoId, puedes usar const key = String(item.productoId);
            const key = item.nombre;

            let r = map.get(key);
            if (!r) {
                r = {
                nombre: item.nombre,
                cantidadTotal: 0,
                items: [],
                };
                map.set(key, r);
            }

            // acumula cantidad total por producto
            r.cantidadTotal += item.cantidad;

            // guarda cada item con su nota
            r.items.push({
                id: item.id,
                cantidad: item.cantidad,
                nota: item.nota??'',
                isExtra: item.isExtra,
            });
            }
        }

        this.resumenProductos = Array.from(map.values())
            .sort((a, b) => a.nombre.localeCompare(b.nombre));
    }



    // ================== TIEMPO Y COLOR ==================

    minutosTranscurridos(p: PedidoDespacho): number {
        const creado = new Date(p.creadoEn).getTime();
        const diffMs = this.now - creado;
        return Math.floor(diffMs / 60000); // minutos
    }

    tiempoLabel(p: PedidoDespacho): string {
        const mins = this.minutosTranscurridos(p);
        if (mins < 1) return 'recién tomado';
        if (mins === 1) return 'hace 1 minuto';
        return `hace ${mins} minutos`;
    }

    claseTiempo(p: PedidoDespacho): string {
        const mins = this.minutosTranscurridos(p);
        const sla = p.tiempoMaxMinutos ?? 20;

        const ratio = mins / sla;
        if (ratio <= 0.5) return 'tiempo-ok';
        if (ratio <= 0.9) return 'tiempo-warning';
        return 'tiempo-danger';
    }

    // ================== ACCIONES ==================

    despachar(p: PedidoDespacho) {
        this.pedidosSrv.marcarComoDespachado(p.id).subscribe({
            next: () => {
                this.showToast('Pedido despachado', 'success');
                this.recalcularResumen();
            },
            error: () => {
                this.showToast('No se pudo despachar el pedido', 'danger');
            }
        });
    }

    async showToast(message: string, color: 'success' | 'danger' | 'primary' = 'primary') {
        const toast = await this.toastCtrl.create({
            message,
            duration: 2000,
            color,
            position: 'top'
        });
        await toast.present();
    }
}
