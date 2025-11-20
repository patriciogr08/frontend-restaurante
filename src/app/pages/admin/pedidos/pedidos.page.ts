import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertController, SegmentChangeEventDetail } from '@ionic/angular';

import {
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonText,
  IonSpinner,
  IonCardSubtitle,
  IonButton,
  IonButtons, IonModal } from '@ionic/angular/standalone';

import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { AdminPedidosService } from 'src/app/core/services/admin-pedidos.service';
import { AdminPedidoDTO } from 'src/app/core/models/facturar.models';
import { FacturarParcialModalComponent, ItemPendienteDTO } from './facturar-parcial-modal/facturar-parcial-modal.component';


export type Estado = 'en_proceso' | 'despachados' | 'cobrados' | 'cancelados';

type FacturarPedidoBody = {
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA';
  propinaMonto?: number;
  items?: { pedidoItemId: number; cantidad: number }[];
};

@Component({
  standalone: true,
  selector: 'app-admin-pedidos',
  imports: [ 
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonText,
    IonSpinner,
    IonCardSubtitle,
    IonButton,
    // componente modal
    FacturarParcialModalComponent,
  ],
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage implements OnInit, OnDestroy {
    readonly estadoCtrl = new FormControl<Estado>('en_proceso', {
        nonNullable: true,
    });

    pedidos: AdminPedidoDTO[] = [];
    pedidoSeleccionado: AdminPedidoDTO | null = null;
    cargando = false;
    cargandoFacturacion = false;

    // estado del modal de facturación parcial
    modalParcialOpen = false;
    itemsParcial: ItemPendienteDTO[] = [];

    private authSrv = inject(AuthService);
    private adminPedidosSrv = inject(AdminPedidosService);
    private alertCtrl = inject(AlertController); // 👈 nuevo

    private socket?: Socket;

    ngOnInit(): void {
        this.initSocket();
        this.cargarPedidos(this.estadoCtrl.value);
    }

    ngOnDestroy(): void {
        if (this.socket && this.socket.connected) {
        this.socket.disconnect();
        }
    }

    // ============== UI ==============

    onSegmentChange(ev: CustomEvent<SegmentChangeEventDetail>) {
        const v = ev.detail.value as Estado | null;
        if (!v) return;

        this.estadoCtrl.setValue(v);
        this.cargarPedidos(v);
    }

    seleccionarPedido(p: AdminPedidoDTO) {
        if (this.pedidoSeleccionado?.id === p.id) {
        this.pedidoSeleccionado = null;
        } else {
        this.pedidoSeleccionado = p;
        }
    }

    get puedeFacturar(): boolean {
        const p = this.pedidoSeleccionado;
        if (!p) return false;
        if (this.estadoCtrl.value !== 'despachados') return false;
        if (p.estadoPedido !== 'DESPACHADO') return false;
        if (p.itemsPendientes <= 0) return false;
        return true;
    }

    // ============== HTTP ==============

    private cargarPedidos(estado: Estado) {
        this.cargando = true;
        this.pedidoSeleccionado = null;

        this.adminPedidosSrv.listarPorEstado(estado).subscribe({
        next: (lista) => {
            this.pedidos = lista;
            this.cargando = false;
        },
        error: (err) => {
            console.error('[ADMIN][Pedidos] error al cargar pedidos', err);
            this.pedidos = [];
            this.cargando = false;
        },
        });
    }

    // ============== FACTURACIÓN ==============

    facturarTodoPendiente() {
        if (!this.puedeFacturar || !this.pedidoSeleccionado) return;
        const p = this.pedidoSeleccionado;

        this.cargandoFacturacion = true;

        const body: FacturarPedidoBody = {
        metodoPago: 'EFECTIVO',
        propinaMonto: 0,
        // sin items => backend factura todo lo pendiente
        };

        this.adminPedidosSrv.facturarPedido(p.id, body).subscribe({
        next: () => {
            this.cargandoFacturacion = false;
            this.cargarPedidos(this.estadoCtrl.value);
        },
        error: (err) => {
            console.error('[ADMIN] Error facturar todo pendiente', err);
            this.cargandoFacturacion = false;
        },
        });
    }

    abrirFacturacionParcial() {
        if (!this.puedeFacturar || !this.pedidoSeleccionado) return;
        const p = this.pedidoSeleccionado;

        this.itemsParcial = (p.items ?? [])
            .filter((it: any) => (it?.pendiente ?? 0) > 0)
            .map((it: any) => ({
            pedidoItemId: it.id,
            nombre: it.nombre ?? '',
            pendiente: it.pendiente ?? 0,
            }));

        console.log('[ADMIN] itemsParcial =>', this.itemsParcial);

        if (!this.itemsParcial.length) return;

        this.modalParcialOpen = true;
    }


    cerrarFacturacionParcial() {
        this.modalParcialOpen = false;
        this.itemsParcial = [];
    }

    onConfirmarParcial(items: { pedidoItemId: number; cantidad: number }[]) {
        if (!this.pedidoSeleccionado) return;

        this.cargandoFacturacion = true;

        const body: FacturarPedidoBody = {
            metodoPago: 'EFECTIVO',
            propinaMonto: 0,
            items,
        };

        this.adminPedidosSrv
        .facturarPedido(this.pedidoSeleccionado.id, body)
        .subscribe({
            next: () => {
            this.cargandoFacturacion = false;
            this.cerrarFacturacionParcial();
            this.cargarPedidos(this.estadoCtrl.value);
            },
            error: (err) => {
            console.error('[ADMIN] Error facturación parcial', err);
            this.cargandoFacturacion = false;
            },
        });
    }

    // ============== SOCKET.IO ==============

    private initSocket() {
        const user = this.authSrv.currentUser;

        if (!user) {
        console.warn('[WS][ADMIN] No hay usuario logueado, no se inicia socket');
        return;
        }

        console.log('[WS][ADMIN] intentando conectar a', environment.wsUrl);

        this.socket = io(environment.wsUrl, {
        transports: ['websocket'],
        });

        this.socket.on('connect', () => {
        console.log('[WS][ADMIN] conectado ✅, id =', this.socket?.id);

        this.socket!.emit('register', {
            rol: 'ADMIN',
            usuarioId: user.id,
        });
        });

        this.socket.on('disconnect', (reason) => {
        console.log('[WS][ADMIN] desconectado ❌', reason);
        });

        this.socket.on('connect_error', (err) => {
        console.error('[WS][ADMIN] connect_error 🔥', err.message);
        });

        this.socket.on('pedido:creado', () => this.refrescarDesdeSocket());
        this.socket.on('pedido:actualizado', () => this.refrescarDesdeSocket());
        this.socket.on('pedido:despachado', () => this.refrescarDesdeSocket());
    }

    private refrescarDesdeSocket() {
        console.log('[WS][ADMIN] refrescando pedidos por evento WS');
        this.cargarPedidos(this.estadoCtrl.value);
    }

    // dentro de la clase
    cancelando = false;

    get puedeCancelar(): boolean {
        const p = this.pedidoSeleccionado;
        if (!p) return false;
        // solo en tab EN PROCESO y estado EN_PROCESO
        if (this.estadoCtrl.value !== 'en_proceso') return false;
        if (p.estadoPedido !== 'EN_PROCESO') return false;
        return true;
    }

    async cancelarPedidoSeleccionado() {
        const p = this.pedidoSeleccionado;
        if (!p || !this.puedeCancelar || this.cancelando) return;

        const alert = await this.alertCtrl.create({
            header: 'Cancelar pedido',
            message:
                `¿Seguro que deseas cancelar el pedido de la mesa #${p.mesaNumero} ?` +
                'La mesa se liberará y el pedido pasará a CANCELADO',
            buttons: [
                {
                text: 'No',
                role: 'cancel',
                },
                {
                text: 'Sí, cancelar',
                role: 'confirm',
                },
            ],
        });

        await alert.present();
        const { role } = await alert.onDidDismiss();
        if (role !== 'confirm') return;

        this.cancelando = true;

        this.adminPedidosSrv.cancelarPedido(p.id).subscribe({
        next: () => {
            this.cancelando = false;
            this.cargarPedidos(this.estadoCtrl.value);
        },
        error: (err) => {
            console.error('[ADMIN] Error al cancelar pedido', err);
            this.cancelando = false;
        },
        });
    }

}
