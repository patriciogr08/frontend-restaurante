import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersService } from '../../../../core/services/users.service';
import { Rol, Usuario } from 'src/app/core/models/users.models';

@Component({
    standalone: true,
    selector: 'app-user-form-modal',
    templateUrl: './user-form.modal.html',
    styleUrls: ['./user-form.modal.scss'],
    imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class UserFormModalComponent {
    @Input() mode: 'create'|'edit' = 'create';
    @Input() user?: Usuario;

    private fb = inject(FormBuilder);
    private api = inject(UsersService);
    private modal = inject(ModalController);

    form = this.fb.group({
        nombre:   ['', [Validators.required, Validators.maxLength(120)]],
        usuario:  ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
        password: [''],
        rol:      ['MESERO' as Rol, [Validators.required]],
        email:    [''],
        telefono: [''],
    });

    ngOnInit() {
        if (this.mode === 'edit' && this.user) {
        this.form.patchValue({
            nombre: this.user.nombre,
            usuario: this.user.usuario,
            rol: this.user.rol,
            email: this.user.email || '',
            telefono: this.user.telefono || ''
        });
        this.form.get('usuario')?.disable(); // no editamos username
        } else {
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        }
    }

    submit() {
        if (this.form.invalid) return;
        const raw = this.form.getRawValue();
        if (this.mode === 'create') {
        this.api.create({
            nombre: raw.nombre!, usuario: raw.usuario!, password: raw.password!,
            rol: raw.rol!, email: raw.email || null, telefono: raw.telefono || null
        }).subscribe(u => this.modal.dismiss(u, 'ok'));
        } else {
        const payload: any = {
            nombre: raw.nombre!, rol: raw.rol!, email: raw.email || null, telefono: raw.telefono || null
        };
        if (raw.password) payload.password = raw.password;
        this.api.update(this.user!.id, payload).subscribe(u => this.modal.dismiss(u, 'ok'));
        }
    }

    close() { this.modal.dismiss(null, 'cancel'); }
}
