import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/angular/standalone';

import { AdminDashboardIndicadoresComponent } from './indicadores/admin-dashboard-indicadores.component';
import { AdminDashboardReportesComponent } from './reportes/admin-dashboard-reportes.component';

type TabDashboard = 'indicadores' | 'reportes';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    AdminDashboardIndicadoresComponent,
    AdminDashboardReportesComponent,
  ],
})
export class DashboardPage {
  activeTab: TabDashboard = 'indicadores';

  changeTab(tab: TabDashboard) {
    this.activeTab = tab;
  }
}
