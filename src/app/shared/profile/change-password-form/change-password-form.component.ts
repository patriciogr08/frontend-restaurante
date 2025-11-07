import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { IonItem, IonLabel, IonInput, IonButton } from '@ionic/angular/standalone';
import { ChangePasswordDto } from '../profile.models';

function matchValidator(group: AbstractControl) {
  const nueva = group.get('nueva')?.value;
  const confirma = group.get('confirma')?.value;
  return nueva === confirma ? null : { mismatch: true };
}

@Component({
  standalone: true,
  selector: 'app-change-password-form',
  imports: [CommonModule, ReactiveFormsModule, IonItem, IonInput, IonButton],
  templateUrl: './change-password-form.component.html',
  styleUrls: ['./change-password-form.component.scss']
})
export class ChangePasswordFormComponent {
    private fb = inject(FormBuilder);
    @Output() changePass = new EventEmitter<ChangePasswordDto>();

    form = this.fb.group({
        actual: ['', [Validators.required]],
        nueva: ['', [Validators.required, Validators.minLength(6)]],
        confirma: ['', [Validators.required]]
    }, { validators: matchValidator });

    submit() {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        const { actual, nueva } = this.form.value as any;
        this.changePass.emit({ actual, nueva });
    }

    get mismatch() { return this.form.touched && this.form.hasError('mismatch'); }
}
