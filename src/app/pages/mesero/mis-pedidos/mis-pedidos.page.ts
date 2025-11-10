import { Component, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
    standalone: true,
    selector: 'app-mis-pedidos',
    imports: [IonicModule],
    templateUrl: './mis-pedidos.page.html',
    styleUrls: ['./mis-pedidos.page.scss']
})
export class MisPedidosPage {
    loading = signal(false);
  // TODO: listar pedidos EN_PROCESO del mesero
}