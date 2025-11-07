import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, ToastController } from '@ionic/angular/standalone';

import { ProfileService } from '../profile/profile.service';
import { Profile, UpdateProfileDto, ChangePasswordDto } from '../profile/profile.models';
import { AuthService } from '../../core/services/auth.service';

// Shared components
import { ProfileCardComponent } from '../profile/profile-card/profile-card.component';
import { ProfileFormComponent } from '../profile/profile-form/profile-form.component';
import { ChangePasswordFormComponent } from '../profile/change-password-form/change-password-form.component';
import { AvatarUploaderComponent } from '../profile/avatar-uploader/avatar-uploader.component';
import { environment } from 'src/environments/environment';

@Component({
    standalone: true,
    selector: 'app-perfil',
    imports: [
        CommonModule, IonContent, IonButton,
        ProfileCardComponent, ProfileFormComponent, ChangePasswordFormComponent, AvatarUploaderComponent
    ],
    templateUrl: './perfil.page.html',
    styleUrls: ['./perfil.page.scss']
})
export class PerfilPage {
    private svc = inject(ProfileService);
    private auth = inject(AuthService);
    private toast = inject(ToastController);

    loading = signal(true);
    saving = signal(false);
    changing = signal(false);
    uploading = signal(false);
    me = signal<Profile | null>(null);

    constructor() {
        this.reload();
    }

    reload() {
        this.loading.set(true);
        this.svc.me().subscribe({
        next: (p) => { 
            this.me.set({ ...p, avatarUrl: absolutize(p.avatarUrl) ?? ''});            
            this.loading.set(false); 
        },
        error: async (e) => {
            this.loading.set(false);
            const t = await this.toast.create({ message: 'No se pudo cargar el perfil', duration: 2200, color: 'danger' });
            t.present();
        }
        });
    }

    async onSave(data: UpdateProfileDto) {
        if (!this.me()) return;
        this.saving.set(true);
        this.svc.update(data).subscribe({
        next: async (p) => {
            this.me.set(p);
            this.saving.set(false);
            const t = await this.toast.create({ message: 'Perfil actualizado', duration: 1800, color: 'success' });
            t.present();
        },
        error: async () => {
            this.saving.set(false);
            const t = await this.toast.create({ message: 'Error al actualizar', duration: 2200, color: 'danger' });
            t.present();
        }
        });
    }

    async onChangePass(data: ChangePasswordDto) {
        this.changing.set(true);
        this.svc.changePassword(data).subscribe({
        next: async () => {
            this.changing.set(false);
            const t = await this.toast.create({ message: 'Contraseña cambiada', duration: 1800, color: 'success' });
            t.present();
        },
        error: async () => {
            this.changing.set(false);
            const t = await this.toast.create({ message: 'No se pudo cambiar la contraseña', duration: 2200, color: 'danger' });
            t.present();
        }
        });
    }

    async onAvatar(file: File) {
        if (!file) return;
        console.log('-> subiendo', file.name, file.type, file.size);
        this.uploading.set(true);
        this.svc.uploadAvatar(file).subscribe({
        next: async (p) => {
            this.me.set(p);
            this.uploading.set(false);
            const t = await this.toast.create({ message: 'Foto actualizada', duration: 1800, color: 'success' });
            t.present();
        },
        error: async () => {
            this.uploading.set(false);
            const t = await this.toast.create({ message: 'Error al subir la foto', duration: 2200, color: 'danger' });
            t.present();
        }
        });
    }

    logout() {
        this.auth.logout();
    }
}

function absolutize(u?: string | null) {
    if (!u) return u ?? null;
    if (/^https?:\/\//i.test(u)) return u; // ya es absoluta
    const base = environment.apiBaseUrl.replace(/\/+$/,''); // ej: http://localhost:3200/api
    // si apiBaseUrl termina en /api y tus archivos salen en /images, quita el /api:
    const origin = base.replace(/\/api$/,'');               // -> http://localhost:3200
    return `${origin}${u.startsWith('/') ? '' : '/'}${u}`;
}
