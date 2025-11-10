import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { allowRolesGuard } from './core/guards/allow-roles.guard';
import { adminGuard } from './core/guards/admin.guarda';

export const routes: Routes = [
    { 
        path: 'login', 
        loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
    {
        path: 'admin',
        canActivate: [AuthGuard, adminGuard],
        loadComponent: () => import('./pages/admin/tabs.page').then(m => m.TabsPage),
        children: [
            { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/dashboard.page').then(m => m.DashboardPage) },
            { path: 'mesas',     loadComponent: () => import('./pages/admin//mesas/mesas.page').then(m => m.AdminMesasPage) },
            { path: 'pedidos',   loadComponent: () => import('./pages/admin/pedidos/pedidos.page').then(m => m.PedidosPage) },
            { path: 'productos', loadComponent: () => import('./pages/admin/productos/productos.page').then(m => m.ProductosPage) },
            { path: 'usuarios',  loadComponent: () => import('./pages/admin/usuarios/usuarios.page').then(m => m.UsuariosPage) },
            { path: 'perfil',    loadComponent: () => import('./shared/perfil/perfil.page').then(m => m.PerfilPage) },
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
        ]
    },
    {
        path: 'mesero',
        canActivate: [AuthGuard, allowRolesGuard],
        data: { roles: ['MESERO'] },
        loadComponent: () => import('./pages/mesero/mesero-tabs.page').then(m => m.MeseroTabsPage),
        children: [
            { path: 'mesas',        loadComponent: () => import('./pages/mesero/mesas/mesas.page').then(m => m.MesasPage) },
            { path: 'pedidos',      loadComponent: () => import('./pages/mesero/pedidos/pedidos.page').then(m => m.PedidosPage) },
            { path: 'mis-pedidos',  loadComponent: () => import('./pages/mesero/mis-pedidos/mis-pedidos.page').then(m => m.MisPedidosPage) },
            { path: 'perfil',       loadComponent: () => import('./shared/perfil/perfil.page').then(m => m.PerfilPage) },
            { path: '', pathMatch: 'full', redirectTo: 'mesas' }
        ]
    },
    { path: '', pathMatch: 'full', redirectTo: 'login' }
];
