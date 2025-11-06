import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: 'login', canActivate: [GuestGuard], loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
    {
        path: 'admin',
        canActivate: [AuthGuard, RoleGuard(['ADMIN'])],
        children: [
        {
            path: 'tabs',
            loadComponent: () => import('./pages/admin/tabs/tabs.page').then(m => m.TabsPage),
            children: [
            { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/dashboard.page').then(m => m.DashboardPage) },
            { path: 'pedidos',   loadComponent: () => import('./pages/admin/pedidos/pedidos.page').then(m => m.PedidosPage) },
            { path: 'productos', loadComponent: () => import('./pages/admin/productos/productos.page').then(m => m.ProductosPage) },
            { path: 'usuarios',  loadComponent: () => import('./pages/admin/usuarios/usuarios.page').then(m => m.UsuariosPage) },
            { path: 'perfil',    loadComponent: () => import('./pages/admin/perfil/perfil.page').then(m => m.PerfilPage) },
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
            ]
        },
        { path: '', pathMatch: 'full', redirectTo: 'tabs' }
        ]
    },

    { path: '', pathMatch: 'full', redirectTo: 'login' },
    { path: '**', redirectTo: 'login' }
];
