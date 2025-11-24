import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';

import { ReporteVentasComponent } from './reporte-ventas/reporte-ventas.component';
import { ReporteProductosComponent } from './reporte-productos/reporte-productos.component';
import { ReporteMeserosComponent } from './reporte-meseros/reporte-meseros.component';

type TipoReporte = 'ventas' | 'productos' | 'meseros' | 'cancelados';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard-reportes',
  templateUrl: './admin-dashboard-reportes.component.html',
  styleUrls: ['./admin-dashboard-reportes.component.scss'],
  imports: [
    CommonModule,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    ReporteVentasComponent,
    ReporteProductosComponent,
    ReporteMeserosComponent,
  ],
})
export class AdminDashboardReportesComponent {
  tipo: TipoReporte = 'ventas';

  changeTipo(t: TipoReporte) {
    this.tipo = t;
  }
}
