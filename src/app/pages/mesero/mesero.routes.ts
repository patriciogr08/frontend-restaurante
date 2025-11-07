import { Routes } from '@angular/router';
import { MeseroTabsPage } from './tabs/mesero-tabs.page';

export const MESERO_ROUTES: Routes = [
    {
        path: '',
        component: MeseroTabsPage,
        children: [
            { path: 'mesas', loadComponent: () => import('./mesas/mesas.page').then(m => m.MesasPage) },
            { path: 'tomar', loadComponent: () => import('./tomar/tomar.page').then(m => m.TomarPage) },
            { path: 'pedidos', loadComponent: () => import('./pedidos/pedidos.page').then(m => m.PedidosPage) },
            { path: 'perfil', loadComponent: () => import('../../shared/perfil/perfil.page').then(m => m.PerfilPage) },
            { path: '', pathMatch: 'full', redirectTo: 'mesas' }
        ]
    }
];
