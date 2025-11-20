// src/app/pages/mesero/mis-pedidos/mis-pedidos.page.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MeseroService } from '../../../core/services/mesero.service';
import { PedidoResumen } from '../../../core/models/mesero.models';
import { firstValueFrom } from 'rxjs';

import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';

type EstadoFiltro = 'EN_PROCESO' | 'DESPACHADO' | 'TODOS';

type EstadoPedido = 'EN_PROCESO' | 'DESPACHADO' | 'COBRADO' | 'CANCELADO';

@Component({
  standalone: true,
  selector: 'app-mis-pedidos',
  templateUrl: './mis-pedidos.page.html',
  styleUrls: ['./mis-pedidos.page.scss'],
  imports: [CommonModule, IonicModule],
})
export class MisPedidosPage implements OnInit, OnDestroy {
  private meseroSrv = inject(MeseroService);
  private toastCtrl = inject(ToastController);
  private router    = inject(Router);
  private authSrv   = inject(AuthService);

  pedidos: PedidoResumen[] = [];
  estadoFiltro: EstadoFiltro = 'EN_PROCESO';

  private socket?: Socket;

  async ngOnInit() {
    this.initSocket();
    await this.cargar();
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
      console.warn('[WS][MIS-PEDIDOS] No hay usuario logueado, no se inicia socket');
      return;
    }

    console.log('[WS][MIS-PEDIDOS] intentando conectar a', environment.wsUrl);

    this.socket = io(environment.wsUrl, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('[WS][MIS-PEDIDOS] conectado ✅, id =', this.socket?.id);

      this.socket!.emit('register', {
        rol: 'MESERO',
        usuarioId: user.id,
      });

      console.log('[WS][MIS-PEDIDOS] register enviado', { rol: 'MESERO', usuarioId: user.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WS][MIS-PEDIDOS] desconectado ❌', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('[WS][MIS-PEDIDOS] connect_error 🔥', err.message);
    });

    const refrescar = (eventName: string, payload: any) => {
      console.log(`[WS][MIS-PEDIDOS] ${eventName}`, payload);
      // recargar con el filtro actual (EN_PROCESO, DESPACHADO o TODOS)
      this.cargar();
    };

    this.socket.on('pedido:creado',      (p: any) => refrescar('pedido:creado', p));
    this.socket.on('pedido:actualizado', (p: any) => refrescar('pedido:actualizado', p));
    this.socket.on('pedido:despachado',  (p: any) => refrescar('pedido:despachado', p));
  }

  // ================== DATA ==================

  async cargar(event?: any) {
    try {
      this.pedidos = await firstValueFrom(
        this.meseroSrv.listMisPedidos({ estado: this.estadoFiltro })
      );
    } catch {
      const t = await this.toastCtrl.create({
        message: 'Error al cargar pedidos',
        duration: 2000,
        color: 'danger',
      });
      t.present();
    } finally {
      event?.target?.complete?.();
    }
  }

  async onSegmentChange(ev: any) {
    this.estadoFiltro = ev.detail.value as EstadoFiltro;
    await this.cargar();
  }

  openPedido(p: PedidoResumen) {
    this.router.navigate(['/mesero/mis-pedidos', p.id]);
  }

  readonly estadoChipConfig: Record<
    EstadoPedido,
    { color: string; icon: string; label: string }
  > = {
    EN_PROCESO: {
      color: 'primary',
      icon: 'time-outline',
      label: 'En proceso',
    },
    DESPACHADO: {
      color: 'tertiary',
      icon: 'restaurant-outline', // o 'cube-outline'
      label: 'Despachado',
    },
    COBRADO: {
      color: 'success',
      icon: 'cash-outline', // o 'checkmark-done-outline'
      label: 'Cobrado',
    },
    CANCELADO: {
      color: 'danger',
      icon: 'close-circle-outline',
      label: 'Cancelado',
    },
  };

  getEstadoConfig(estado: string) {
    return this.estadoChipConfig[estado as EstadoPedido] ?? {
      color: 'medium',
      icon: 'help-circle-outline',
      label: estado,
    };
  }
}
