import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IonItem, IonLabel, IonInput, IonButton } from '@ionic/angular/standalone';
import { UpdateProfileDto } from '../profile.models';

@Component({
    standalone: true,
    selector: 'app-profile-form',
    imports: [CommonModule, ReactiveFormsModule, IonItem, IonInput, IonButton],
    templateUrl: './profile-form.component.html',
    styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent {
    private fb = inject(FormBuilder);

    @Input() set values(v: Partial<UpdateProfileDto> | null) {
        if (v) this.form.patchValue(v);
    }
    @Output() save = new EventEmitter<UpdateProfileDto>();

    form = this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        telefono: [''],
        email: ['', [Validators.email]]
    });

    submit() {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        this.save.emit(this.form.value as UpdateProfileDto);
    }

    has(ctrl: keyof UpdateProfileDto, err: string) {
        const c = this.form.get(ctrl as string);
        return !!(c && c.touched && c.hasError(err));
    }
}
