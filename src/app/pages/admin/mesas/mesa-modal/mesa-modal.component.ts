import { Component, Input, inject } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MesasService } from '../../../../core/services/mesas.service';
import { Mesa } from 'src/app/core/models/mesas.models';

@Component({
  standalone: true,
  selector: 'app-mesa-modal',
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './mesa-modal.component.html',
  styleUrls: ['./mesa-modal.component.scss']
})
export class MesaModalComponent {
    @Input() mode: 'create'|'edit' = 'create';
    @Input() mesa?: Mesa; 

    private fb = inject(FormBuilder);
    private modal = inject(ModalController);

    form = this.fb.group({
        numero: [0, [Validators.required, Validators.min(1)]],
        capacidad: [2, [Validators.required, Validators.min(1), Validators.max(20)]],
    });

    ngOnInit() {
        if (this.mode === 'edit' && this.mesa) {
        this.form.patchValue({ numero: this.mesa.numero, capacidad: this.mesa.capacidad });
        }
    }

    close() { this.modal.dismiss(null, 'cancel'); }

    submit() {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        this.modal.dismiss(this.form.getRawValue(), 'ok');
    }
}
