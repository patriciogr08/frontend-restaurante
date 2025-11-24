import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonLabel,
    IonSpinner, IonChip } from '@ionic/angular/standalone';
import { AdminReportesService } from 'src/app/core/services/admin-reportes.service';

@Component({
    standalone: true,
    selector: 'app-reporte-productos',
    templateUrl: './reporte-productos.component.html',
    styleUrls: ['./reporte-productos.component.scss'],
    imports: [IonChip, 
        CommonModule,
        FormsModule,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardSubtitle,
        IonCardContent,
        IonButton,
        IonLabel,
        IonSpinner,
    ],
})
export class ReporteProductosComponent {
    private reportesSrv = inject(AdminReportesService);

    // filtros
    desde = '';
    hasta = '';
    categoriaId: number | 'TODAS' = 'TODAS';

    loading = false;
    data: any = null;

    get rows(): any[] {
        return this.data?.rows ?? [];
    }

    buscar() {
        this.loading = true;
        const params: { desde?: string; hasta?: string; metodoPago?: string } = {};
        if (this.desde) params.desde = this.desde;
        if (this.hasta) params.hasta = this.hasta;

        this.reportesSrv.getProductos(params).subscribe({
            next: (resp) => {
                this.data = resp;
                this.loading = false;
            },
            error: (err) => {
                console.error('[ADMIN][Reportes] error al productos ventas', err);
                this.data = null;
                this.loading = false;
            },
        });
    }

    descargarExcel() {
        const params: { desde?: string; hasta?: string; metodoPago?: string } = {};
        if (this.desde) params.desde = this.desde;
        if (this.hasta) params.hasta = this.hasta;

        this.reportesSrv.descargarProductosExcel(params).subscribe({
            next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            const desde = this.data?.fechaDesde || this.desde || 'sin_fecha';
            const hasta = this.data?.fechaHasta || this.hasta || 'sin_fecha';

            a.download = `reporte_productos_${desde}_a_${hasta}.xlsx`;
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
