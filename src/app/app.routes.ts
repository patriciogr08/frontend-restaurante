import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
    { path: 'login', canActivate: [GuestGuard], loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
    {
        path: 'admin',
        canActivate: [AuthGuard],
        children: [
        {
            path: 'tabs',
            loadComponent: () => import('./pages/admin/tabs/tabs.page').then(m => m.TabsPage),
            children: [
            { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/dashboard.page').then(m => m.DashboardPage) },
            { path: 'pedidos',   loadComponent: () => import('./pages/admin/pedidos/pedidos.page').then(m => m.PedidosPage) },
            { path: 'productos', loadComponent: () => import('./pages/admin/productos/productos.page').then(m => m.ProductosPage) },
            { path: 'usuarios',  loadComponent: () => import('./pages/admin/usuarios/usuarios.page').then(m => m.UsuariosPage) },
            { path: 'perfil',    loadComponent: () => import('./shared/perfil/perfil.page').then(m => m.PerfilPage) },
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
            ]
        },
        { path: '', pathMatch: 'full', redirectTo: 'tabs' }
        ]
    },
    {
        path: 'mesero',
        loadChildren: () => import('./pages/mesero/mesero.routes').then(m => m.MESERO_ROUTES)
    },
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    { path: '**', redirectTo: 'login' }
];
