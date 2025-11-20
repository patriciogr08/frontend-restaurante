import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle } from '@ionic/angular/standalone';

export interface ItemPendienteDTO {
  pedidoItemId: number;
  nombre: string;
  pendiente: number;
}

@Component({
    standalone: true,
    selector: 'app-facturar-parcial-modal',
    imports: [IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, 
        CommonModule,
        ReactiveFormsModule,
        IonModal,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonButton,
        IonContent,
        IonList,
        IonItem,
        IonLabel,
        IonInput,
        IonText,
        IonCardContent
    ],
    templateUrl: './facturar-parcial-modal.component.html',
    styleUrls: ['./facturar-parcial-modal.component.scss'], 
})
export class FacturarParcialModalComponent {
    @Input() isOpen = false;

    // items se maneja con setter para reconstruir el formulario
    private _items: ItemPendienteDTO[] = [];
    @Input()
    set items(value: ItemPendienteDTO[] | null | undefined) {
        this._items = value ?? [];
        this.buildForm();
    }
    get items(): ItemPendienteDTO[] {
        return this._items;
    }

    @Input() mesaNumero: number | null = null;
    @Input() itemsPendientes: number | null = null;

    @Output() close = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<
        { pedidoItemId: number; cantidad: number }[]
    >();

    form = new FormGroup({
        cantidades: new FormArray<FormControl<number>>([]),
    });

    get cantidades(): FormArray<FormControl<number>> {
        return this.form.get('cantidades') as FormArray<FormControl<number>>;
    }

    private buildForm() {
        this.cantidades.clear();

        const src = this._items ?? [];

        for (const it of src) {
        this.cantidades.push(
            new FormControl<number>(it.pendiente, { nonNullable: true }),
        );
        }

        // Debug opcional
        console.log('[MODAL] items recibidos =>', this.items.length);
        console.log('[MODAL] cantidades =>', this.cantidades.value);
    }

    onDidDismiss() {
        this.close.emit();
    }

    onConfirm() {
        const result: { pedidoItemId: number; cantidad: number }[] = [];

        this.cantidades.controls.forEach((ctrl, index) => {
        const meta = this._items[index];
        if (!meta) return;

        let value = ctrl.value ?? 0;
        if (value < 0) value = 0;
        if (value > meta.pendiente) value = meta.pendiente;

        if (value > 0) {
            result.push({
            pedidoItemId: meta.pedidoItemId,
            cantidad: value,
            });
        }
        });

        if (!result.length) {
        this.close.emit();
        return;
        }

        this.confirm.emit(result);
    }
}
