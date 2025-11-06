import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  IonContent, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonItem, IonLabel, IonInput, IonButton, IonIcon,
  LoadingController, ToastController
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, logInOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';

@Component({
    standalone: true,
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
    imports: [
        CommonModule, ReactiveFormsModule,
        IonContent, IonItem, IonInput, IonButton, IonIcon
    ]
})
export class LoginPage {
    anio = new Date().getFullYear()
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private router = inject(Router);
    private loading = inject(LoadingController);
    private toast = inject(ToastController);

    showPassword = false;

    form = this.fb.group({
    usuario: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    });

    constructor() {
        addIcons({ eyeOutline, eyeOffOutline, logInOutline, mailOutline, lockClosedOutline });
    }

    hasError(ctrl: 'usuario' | 'password', error: string) {
        const c = this.form.get(ctrl);
        return !!(c && c.touched && c.hasError(error));
    }

    async submit() {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        const loader = await this.loading.create({ message: 'Ingresando…' });
        await loader.present();

        this.auth.login(this.form.value as any).subscribe({
            next: async (resp) => {
            this.auth.setSession(resp);
            await loader.dismiss();
            this.router.navigateByUrl('/admin/tabs', { replaceUrl: true });
            },
            error: async (err) => {
            await loader.dismiss();
            const t = await this.toast.create({
                message: err?.error?.message || 'Usuario o contraseña inválidos',
                duration: 2500, color: 'danger'
            });
            t.present();
            }
        });
    }
}
