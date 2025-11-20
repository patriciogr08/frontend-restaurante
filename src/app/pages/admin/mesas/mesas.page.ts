// src/app/pages/admin/mesas/mesas.page.ts
import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, AlertController, IonRefresher } from '@ionic/angular';
import { MesasService } from 'src/app/core/services/mesas.service';
import { MesaModalComponent } from './mesa-modal/mesa-modal.component';
import { Mesa } from 'src/app/core/models/mesas.models';

import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
    standalone: true,
    selector: 'app-admin-mesas',
    imports: [CommonModule, IonicModule],
    templateUrl: './mesas.page.html',
    styleUrls: ['./mesas.page.scss']
})
export class AdminMesasPage implements OnInit, OnDestroy {

    // servicios
    private svc   = inject(MesasService);
    private modal = inject(ModalController);
    private toast = inject(ToastController);
    private alert = inject(AlertController);
    private auth  = inject(AuthService);

    // socket
    private socket?: Socket;

    loading = signal(false);
    includeDeleted = signal(false);
    all = signal<Mesa[]>([]);

    activos   = computed(() => this.all().filter(m => !m.deletedAt).sort((a,b)=>a.numero-b.numero));
    eliminados = computed(() => this.all().filter(m => !!m.deletedAt).sort((a,b)=>a.numero-b.numero));

    // Se ejecuta una sola vez cuando la page se crea
    ngOnInit(): void {
        this.initSocket();
    }

    // Se ejecuta cada vez que la vista entra en pantalla (Ionic)
    ionViewWillEnter() { this.load(); }

    ngOnDestroy(): void {
        if (this.socket && this.socket.connected) {
            this.socket.disconnect();
        }
    }

    // ================== SOCKET.IO ==================s
    private initSocket() {
        const user = this.auth.currentUser; // ajusta según tu AuthService

        if (!user) {
            console.warn('[WS][ADMIN-MESAS] No hay usuario logueado, no se inicia socket');
            return;
        }

        console.log('[WS][ADMIN-MESAS] intentando conectar a', environment.wsUrl);

        this.socket = io(environment.wsUrl, {
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('[WS][ADMIN-MESAS] conectado ✅, id =', this.socket?.id);

            // IMPORTANTE: coincide con tu backend (evento "register")
            this.socket!.emit('register', {
                rol: 'ADMIN',
                usuarioId: user.id,
            });

            console.log('[WS][ADMIN-MESAS] register enviado', { rol: 'ADMIN', usuarioId: user.id });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('[WS][ADMIN-MESAS] desconectado ❌', reason);
        });

        this.socket.on('connect_error', (err) => {
            console.error('[WS][ADMIN-MESAS] connect_error 🔥', err.message);
        });

        // Eventos relacionados a pedidos/mesas que impactan la ocupación
        this.socket.on('pedido:creado',  (payload: any) => {
            console.log('[WS][ADMIN-MESAS] pedido:creado', payload);
            this.refrescarMesasDesdeSocket();
        });

        this.socket.on('pedido:actualizado', (payload: any) => {
            console.log('[WS][ADMIN-MESAS] pedido:actualizado', payload);
            this.refrescarMesasDesdeSocket();
        });

        this.socket.on('pedido:despachado', (payload: any) => {
            console.log('[WS][ADMIN-MESAS] pedido:despachado', payload);
            this.refrescarMesasDesdeSocket();
        });

        // Si más adelante emites un evento específico de mesa:
        this.socket.on('mesa:actualizada', (payload: any) => {
            console.log('[WS][ADMIN-MESAS] mesa:actualizada', payload);
            this.refrescarMesasDesdeSocket();
        });
    }

    private refrescarMesasDesdeSocket() {
        // simple y efectivo: recargar todas las mesas
        this.load();
    }

    // ================== CRUD MESAS ==================

    load() {
        this.loading.set(true);
        this.svc.list(true).subscribe({
            next: rows => { 
                this.all.set(rows); 
                this.loading.set(false); 
            },
            error: async () => {
                this.loading.set(false);
                (await this.toast.create({ message: 'No se pudieron cargar las mesas', duration: 1800, color: 'danger' })).present();
            }
        });
    }

    async openCreate() {
        const m = await this.modal.create({ component: MesaModalComponent, componentProps: { mode: 'create' } });
        await m.present();
        const { data, role } = await m.onWillDismiss();
        if (role === 'ok') {
            this.svc.create(data).subscribe({
                next: mesa => this.all.update(list => [...list, mesa]),
                error: async e => (await this.toast.create({ message: e?.error?.message || 'No se pudo crear', duration: 2000, color: 'danger' })).present()
            });
        }
    }

    async openEdit(row: Mesa) {
        const m = await this.modal.create({ component: MesaModalComponent, componentProps: { mode: 'edit', mesa: row } });
        await m.present();
        const { data, role } = await m.onWillDismiss();
        if (role === 'ok') {
            this.svc.update(row.id, data).subscribe({
                next: up => this.all.update(list => list.map(x => x.id === up.id ? up : x)),
                error: async e => (await this.toast.create({ message: e?.error?.message || 'No se pudo actualizar', duration: 2000, color: 'danger' })).present()
            });
        }
    }

    async remove(row: Mesa) {
        const a = await this.alert.create({
            header: 'Eliminar mesa',
            message: `¿Eliminar la mesa #${row.numero}? (soft-delete)`,
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                { text: 'Eliminar', role: 'destructive', handler: () => {
                    this.svc.remove(row.id).subscribe({
                        next: () => {
                            this.all.update(list => list.map(x => x.id === row.id ? { ...x, deletedAt: new Date().toISOString() } : x));
                        },
                        error: async () => (await this.toast.create({ message: 'No se pudo eliminar', duration: 1800, color: 'danger' })).present()
                    });
                } }
            ]
        });
        await a.present();
    }

    restore(row: Mesa) {
        this.svc.restore(row.id).subscribe({
            next: up => this.all.update(list => list.map(x => x.id === up.id ? up : x)),
            error: async () => (await this.toast.create({ message: 'No se pudo restaurar', duration: 1800, color: 'danger' })).present()
        });
    }

    onRefresh(ev: CustomEvent) {
        this.load();
        setTimeout(() => (ev.target as unknown as IonRefresher).complete(), 400);
    }
}
