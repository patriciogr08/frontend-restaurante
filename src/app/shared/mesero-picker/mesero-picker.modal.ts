import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { UsersService } from 'src/app/core/services/users.service';
import { UsuarioBasico } from 'src/app/core/models/users.models';

@Component({
  standalone: true,
  selector: 'app-mesero-picker-modal',
  templateUrl: './mesero-picker.modal.html',
  styleUrls: ['./mesero-picker.modal.scss'],
  imports: [CommonModule, IonicModule],
})
export class MeseroPickerModal implements OnInit {
    private usuariosSrv = inject(UsersService);
    private modalCtrl    = inject(ModalController);
    private toastCtrl    = inject(ToastController);

    term = '';
    loading = false;
    meseros: UsuarioBasico[] = [];

    async ngOnInit() {
        // Opcional: cargar lista inicial sin filtro
        await this.buscar();
    }

    async onBuscar(ev: any) {
        this.term = ev.detail.value;
        await this.buscar();
    }

    private async buscar() {
        this.loading = true;
        try {
        this.meseros = await firstValueFrom(
            this.usuariosSrv.listMeseros(this.term?.trim() || undefined)
        );
        } catch {
        const t = await this.toastCtrl.create({
            message: 'Error al cargar meseros',
            duration: 2000,
            color: 'danger',
        });
        t.present();
        } finally {
        this.loading = false;
        }
    }

    cerrar() {
        this.modalCtrl.dismiss(null, 'cancel');
    }

    seleccionar(m: UsuarioBasico) {
        this.modalCtrl.dismiss({ mesero: m }, 'ok');
    }
}
