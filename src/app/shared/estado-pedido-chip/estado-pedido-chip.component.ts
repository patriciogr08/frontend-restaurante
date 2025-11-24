// src/app/shared/components/estado-pedido-chip/estado-pedido-chip.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonChip, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  timeOutline,
  restaurantOutline,
  cashOutline,
  closeCircleOutline,
  helpCircleOutline,
} from 'ionicons/icons';

export type EstadoPedido =
  | 'EN_PROCESO'
  | 'DESPACHADO'
  | 'COBRADO'
  | 'CANCELADO';

@Component({
  standalone: true,
  selector: 'app-estado-pedido-chip',
  imports: [CommonModule, IonChip, IonIcon, IonLabel],
  templateUrl: './estado-pedido-chip.component.html',
  styleUrls: ['./estado-pedido-chip.component.scss'],
})
export class EstadoPedidoChipComponent {
  // estado que viene del backend
  @Input() estado: string | null = null;
  // opcional: puedes ocultar el texto y dejar solo el icono
  @Input() showLabel = true;
  // opcional: tamaño del chip
  @Input() size: 'small' | 'default' = 'small';

  constructor() { }

  private readonly estadoChipConfig: Record<
    EstadoPedido,
    { color: string; icon: string; label: string }
  > = {
    EN_PROCESO: {
      color: 'primary',
      icon: 'time-outline',
      label: 'En proceso',
    },
    DESPACHADO: {
      color: 'tertiary',
      icon: 'restaurant-outline',
      label: 'Despachado',
    },
    COBRADO: {
      color: 'success',
      icon: 'cash-outline',
      label: 'Cobrado',
    },
    CANCELADO: {
      color: 'danger',
      icon: 'close-circle-outline',
      label: 'Cancelado',
    },
  };

  get config() {
    const estado = (this.estado ?? '').toUpperCase() as EstadoPedido;

    return (
      this.estadoChipConfig[estado] ?? {
        color: 'medium',
        icon: 'help-circle-outline',
        label: this.estado ?? 'N/D',
      }
    );
  }
}
