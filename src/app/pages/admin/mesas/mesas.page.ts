import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, AlertController, IonRefresher } from '@ionic/angular';
import { MesasService } from 'src/app/core/services/mesas.service';
import { MesaModalComponent } from './mesa-modal/mesa-modal.component';
import { Mesa } from 'src/app/core/models/mesas.models';

@Component({
    standalone: true,
    selector: 'app-admin-mesas',
    imports: [CommonModule, IonicModule],
    templateUrl: './mesas.page.html',
    styleUrls: ['./mesas.page.scss']
})
export class AdminMesasPage {
    private svc = inject(MesasService);
    private modal = inject(ModalController);
    private toast = inject(ToastController);
    private alert = inject(AlertController);

    constructor() {
    }

    loading = signal(false);
    includeDeleted = signal(false);
    all = signal<Mesa[]>([]);

    activos = computed(() => this.all().filter(m => !m.deletedAt).sort((a,b)=>a.numero-b.numero));
    eliminados = computed(() => this.all().filter(m => !!m.deletedAt).sort((a,b)=>a.numero-b.numero));

    ionViewWillEnter() { this.load(); }

    load() {
        this.loading.set(true);
        this.svc.list(true).subscribe({
        next: rows => { this.all.set(rows); this.loading.set(false); },
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
                // marcamos como eliminada en el listado (si el backend no la devuelve, podemos forzar flag)
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
