import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { UsersService } from '../../../core/services/users.service';
import { UserFormModalComponent } from './user-form/user-form.modal';
import { Usuario } from 'src/app/core/models/users.models';

@Component({
  standalone: true,
  selector: 'app-usuarios',
  imports: [CommonModule, IonicModule],
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss']
})
export class UsuariosPage {
    private api = inject(UsersService);
    private modal = inject(ModalController);
    private toast = inject(ToastController);

    loading = signal(false);
    items   = signal<Usuario[]>([]);

    ionViewWillEnter() { this.reload(); }

    reload() {
        this.loading.set(true);
        this.api.list().subscribe({
        next: (rows) => { this.items.set(rows); this.loading.set(false); },
        error: async () => {
            this.loading.set(false);
            (await this.toast.create({ message: 'Error cargando usuarios', duration: 2000, color: 'danger' })).present();
        }
        });
    }

    async openCreate() {
        const m = await this.modal.create({ component: UserFormModalComponent, componentProps: { mode: 'create' } });
        await m.present();
        const { data, role } = await m.onDidDismiss();
        if (role === 'ok') this.items.update(list => [data, ...list]);
    }

    async openEdit(u: Usuario) {
        const m = await this.modal.create({ component: UserFormModalComponent, componentProps: { mode: 'edit', user: u } });
        await m.present();
        const { data, role } = await m.onDidDismiss();
        if (role === 'ok') this.items.update(list => list.map(x => x.id === data.id ? data : x));
    }

    toggleEstado(u: Usuario) {
        const nuevo = u.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        this.api.setEstado(u.id, nuevo).subscribe({
        next: () => this.items.update(list => list.map(x => x.id === u.id ? { ...x, estado: nuevo } : x))
        });
    }
}
