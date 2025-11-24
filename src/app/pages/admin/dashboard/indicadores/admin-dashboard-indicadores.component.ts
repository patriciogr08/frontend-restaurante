import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonSpinner,
    IonText,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonToolbar,
    IonBadge, IonHeader, IonButton, IonTitle, IonContent } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';

import { AdminDashboardService } from 'src/app/core/services/admin-dashboard.service';
import {
  AdminDashboardResponse,
  VentaPorHora,
  TopProducto,
  PedidoDemorado,
  PedidoCobrado,
  MetodoPagoResumen,
} from 'src/app/core/models/dashboard.models';

type ModoRango = 'HOY' | 'ULT7' | 'PERSONALIZADO';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard-indicadores',
  templateUrl: './admin-dashboard-indicadores.component.html',
  styleUrls: ['./admin-dashboard-indicadores.component.scss'],
  imports: [IonContent, IonButton,
    CommonModule,
    FormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonSpinner,
    IonText,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonBadge,
  ],
})
export class AdminDashboardIndicadoresComponent implements OnInit {
    private dashboardSrv = inject(AdminDashboardService);

    loading = false;
    data: AdminDashboardResponse | null = null;

      // filtros
    modoRango: ModoRango = 'HOY';
    fechaSeleccionada: string | null = null;  // para "por día" si quisieras
    desdeSeleccionado: string | null = null;
    hastaSeleccionado: string | null = null;

    ngOnInit() {
        this.loadDashboardHoy();
    }

    loadDashboardHoy() {
        this.modoRango = 'HOY';
        // 🔹 importante: limpiar inputs
        this.desdeSeleccionado = null;
        this.hastaSeleccionado = null;
        this.loading = true;
        this.dashboardSrv.getDashboard().subscribe({
        next: (resp) => {
            this.data = resp;
            this.loading = false;
        },
        error: (err) => {
            console.error('[ADMIN][Dashboard] error', err);
            this.data = null;
            this.loading = false;
        },
        });
    }

    loadDashboardUltimos7() {
        this.modoRango = 'ULT7';
        // 🔹 importante: limpiar inputs
        this.desdeSeleccionado = null;
        this.hastaSeleccionado = null;
        
        const hoy = new Date();
        const hasta = hoy.toISOString().slice(0, 10);

        const d = new Date(hoy);
        d.setDate(d.getDate() - 6); // hoy + 6 días = 7 días en total
        const desde = d.toISOString().slice(0, 10);

        this.loading = true;
        this.dashboardSrv.getDashboard({ desde, hasta }).subscribe({
        next: (resp) => {
            this.data = resp;
            this.loading = false;
        },
        error: (err) => {
            console.error('[ADMIN][Dashboard] error', err);
            this.data = null;
            this.loading = false;
        },
        });
    }

    aplicarRangoPersonalizado() {
        if (!this.desdeSeleccionado || !this.hastaSeleccionado) {
        return;
        }

        this.modoRango = 'PERSONALIZADO';
        this.loading = true;

        this.dashboardSrv
        .getDashboard({
            desde: this.desdeSeleccionado,
            hasta: this.hastaSeleccionado,
        })
        .subscribe({
            next: (resp) => {
            this.data = resp;
            this.loading = false;
            },
            error: (err) => {
            console.error('[ADMIN][Dashboard] error', err);
            this.data = null;
            this.loading = false;
            },
        });
    }

    onDesdeChange(e: Event) {
        const value = (e.target as HTMLInputElement).value || null;
        this.desdeSeleccionado = value;
    }

    onHastaChange(e: Event) {
        const value = (e.target as HTMLInputElement).value || null;
        this.hastaSeleccionado = value;
    }


    // Helpers para el template
    get ventasPorHora(): VentaPorHora[] {
        return this.data?.ventasPorHora ?? [];
    }

    get topProductos(): TopProducto[] {
        return this.data?.topProductos ?? [];
    }

    get pedidosDemorados(): PedidoDemorado[] {
        return this.data?.pedidosDemorados ?? [];
    }

    get ultimosCobrados(): PedidoCobrado[] {
        return this.data?.ultimosCobrados ?? [];
    }

    get metodosPago(): MetodoPagoResumen[] {
        return this.data?.metodosPago ?? [];
    }

    get kpis() {
        return this.data?.kpis;
    }

    maxVentasHora(): number {
        const arr = this.ventasPorHora;
        if (!arr.length) return 0;
        return Math.max(...arr.map((v) => v.total));
    }

    maxTopProductos(): number {
        const arr = this.topProductos;
        if (!arr.length) return 0;
        return Math.max(...arr.map((t) => t.cantidad));
    }
}