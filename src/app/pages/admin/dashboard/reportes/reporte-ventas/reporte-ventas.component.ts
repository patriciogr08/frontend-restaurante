import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonText,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonBadge,
    IonSpinner,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';

import { AdminReportesService } from 'src/app/core/services/admin-reportes.service';
import { ReporteVentasResponse, ReporteVentasRow } from 'src/app/core/models/reportes.models';

type MetodoPagoFiltro = 'TODOS' | 'EFECTIVO' | 'TRANSFERENCIA';

@Component({
  standalone: true,
  selector: 'app-reporte-ventas',
  templateUrl: './reporte-ventas.component.html',
  styleUrls: ['./reporte-ventas.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonLabel,
    IonChip,
    IonBadge,
    IonSpinner,
  ],
})
export class ReporteVentasComponent {
private reportesSrv = inject(AdminReportesService);

    // filtros
    desde: string = '';
    hasta: string = '';
    metodoPago: MetodoPagoFiltro = 'TODOS';

    loading = false;
    data: ReporteVentasResponse | null = null;

    get rows(): ReporteVentasRow[] {
        return this.data?.rows ?? [];
    }

    buscar() {
        this.loading = true;

        const params: { desde?: string; hasta?: string; metodoPago?: string } = {};
        if (this.desde) params.desde = this.desde;
        if (this.hasta) params.hasta = this.hasta;
        if (this.metodoPago !== 'TODOS') params.metodoPago = this.metodoPago;

        this.reportesSrv.getVentas(params).subscribe({
            next: (resp) => {
                this.data = resp;
                this.loading = false;
            },
            error: (err) => {
                console.error('[ADMIN][Reportes] error al cargar ventas', err);
                this.data = null;
                this.loading = false;
            },
        });
    }

    descargarExcel() {
        const params: { desde?: string; hasta?: string; metodoPago?: string } = {};
        if (this.desde) params.desde = this.desde;
        if (this.hasta) params.hasta = this.hasta;
        if (this.metodoPago !== 'TODOS') params.metodoPago = this.metodoPago;

        this.reportesSrv.descargarVentasExcel(params).subscribe({
            next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            const desde = this.data?.fechaDesde || this.desde || 'sin_fecha';
            const hasta = this.data?.fechaHasta || this.hasta || 'sin_fecha';

            a.download = `reporte_ventas_${desde}_a_${hasta}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
            },
            error: (err) => {
            console.error('[ADMIN][Reportes] error al descargar Excel', err);
            },
        });
    }


    onDesdeChange(e: Event) {
        this.desde = (e.target as HTMLInputElement).value || '';
    }

    onHastaChange(e: Event) {
        this.hasta = (e.target as HTMLInputElement).value || '';
    }
}
