import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  AlertController,
  LoadingController,
  ToastController,
  ModalController,
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { MeseroService } from '../../../core/services/mesero.service';
import { Carrito, CarritoItem } from '../../../core/models/mesero.models';
import { firstValueFrom } from 'rxjs';
import { ProductoPickerModal } from './producto-picker/producto-picker.modal';

@Component({
    standalone: true,
    selector: 'app-pedidos-mesero',
    templateUrl: './pedidos.page.html',
    styleUrls: ['./pedidos.page.scss'],
    imports: [CommonModule, IonicModule],
})
export class PedidosPage implements OnInit {
    private route       = inject(ActivatedRoute);
    private meseroSrv   = inject(MeseroService);
    private loadingCtrl = inject(LoadingController);
    private toastCtrl   = inject(ToastController);
    private alertCtrl   = inject(AlertController);
    private modalCtrl   = inject(ModalController);
    private router      = inject(Router);



    mesaId?: number;
    carritoId?: number;
    carrito: Carrito | null = null;

    ngOnInit() {
        this.route.queryParamMap.subscribe((qp) => {
        this.mesaId = qp.get('mesaId') ? Number(qp.get('mesaId')) : undefined;
        this.carritoId = qp.get('carritoId') ? Number(qp.get('carritoId')) : undefined;

        if (this.carritoId) {
            this.cargarCarrito();
        } else if (this.mesaId) {
            this.cargarCarritoPorMesa();
        }
        });
    }

    async cargarCarritoPorMesa() {
        if (!this.mesaId) return;
        const loader = await this.loadingCtrl.create({ message: 'Cargando carrito...' });
        await loader.present();
        try {
        const c = await firstValueFrom(
            this.meseroSrv.getCarritoActivoByMesa(this.mesaId)
        );
        this.carrito = c;
        this.carritoId = c.id;
        } catch (err: any) {
        const msg = err?.error?.message || 'No hay carrito activo para esta mesa';
        const t = await this.toastCtrl.create({
            message: msg,
            duration: 2000,
            color: 'warning',
        });
        t.present();
        } finally {
        loader.dismiss();
        }
    }

    async cargarCarrito(event?: any) {
        if (!this.carritoId) return;
        try {
        this.carrito = await firstValueFrom(
            this.meseroSrv.getCarrito(this.carritoId)
        );
        } catch (err: any) {
        const msg = err?.error?.message || 'Error al cargar carrito';
        const t = await this.toastCtrl.create({
            message: msg,
            duration: 2000,
            color: 'danger',
        });
        t.present();
        } finally {
        event?.target?.complete?.();
        }
    }

    get tieneItems() {
        return !!this.carrito?.items?.length;
    }

    async agregarItem() {
        if (!this.carritoId) return;

        // 1) Abrir modal para seleccionar producto
        const modal = await this.modalCtrl.create({
            component: ProductoPickerModal,
            componentProps: {
            // puedes pasar tipo si quieres: tipo: 1
            },
        });

        await modal.present();
        const { data, role } = await modal.onWillDismiss();

        if (role !== 'ok' || !data?.producto) {
            return; // cancelado
        }

        const producto = data.producto as { id: number; nombre: string };

        // 2) Preguntar cantidad y notas con Alert
        const alert = await this.alertCtrl.create({
            header: `Agregar ${producto.nombre}`,
            inputs: [
            { name: 'cantidad', type: 'number', placeholder: 'Cantidad', value: 1 },
            { name: 'notas', type: 'text', placeholder: 'Notas (opcional)' },
            ],
            buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Agregar',
                handler: async (dataAlert) => {
                const loader = await this.loadingCtrl.create({ message: 'Agregando...' });
                await loader.present();
                try {
                    await firstValueFrom(
                    this.meseroSrv.addCarritoItem(this.carritoId!, {
                        productoId: producto.id,
                        cantidad: Number(dataAlert.cantidad || 1),
                        notas: dataAlert.notas || undefined,
                    })
                    );
                    await this.cargarCarrito();
                    const t = await this.toastCtrl.create({
                        message: 'Item agregado',
                        duration: 1500,
                        color: 'success',
                    });
                    t.present();
                } catch (err: any) {
                    const msg = err?.error?.message || 'No se pudo agregar el item';
                    const t = await this.toastCtrl.create({
                    message: msg,
                    duration: 2000,
                    color: 'danger',
                    });
                    t.present();
                } finally {
                    loader.dismiss();
                }
                },
            },
            ],
        });

        await alert.present();
    }


    async editarItem(item: CarritoItem) {
        if (!this.carritoId) return;
        const alert = await this.alertCtrl.create({
        header: 'Editar item',
        inputs: [
            { name: 'cantidad', type: 'number', value: item.cantidad, placeholder: 'Cantidad' },
            { name: 'notas', type: 'text', value: item.notas ?? '', placeholder: 'Notas' },
        ],
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
            text: 'Guardar',
            handler: async (data) => {
                const loader = await this.loadingCtrl.create({ message: 'Actualizando...' });
                await loader.present();
                try {
                    await firstValueFrom(
                        this.meseroSrv.editCarritoItem(this.carritoId!, item.id, {
                        cantidad: Number(data.cantidad),
                        notas: data.notas,
                        })
                    );
                    await this.cargarCarrito();
                } catch (err: any) {
                    const msg = err?.error?.message || 'Error al actualizar';
                    const t = await this.toastCtrl.create({
                        message: msg,
                        duration: 2000,
                        color: 'danger',
                    });
                    t.present();
                } finally {
                    loader.dismiss();
                }
            },
            },
        ],
        });

        await alert.present();
    }

    async eliminarItem(item: CarritoItem) {
        if (!this.carritoId) return;
        const alert = await this.alertCtrl.create({
        header: 'Eliminar item',
        message: '¿Seguro que deseas eliminar este item?',
        buttons: [
            { text: 'No', role: 'cancel' },
            {
            text: 'Sí, eliminar',
            role: 'destructive',
            handler: async () => {
                const loader = await this.loadingCtrl.create({ message: 'Eliminando...' });
                await loader.present();
                try {
                    await firstValueFrom(
                        this.meseroSrv.removeCarritoItem(this.carritoId!, item.id)
                    );
                    await this.cargarCarrito();
                } catch (err: any) {
                    const msg = err?.error?.message || 'Error al eliminar';
                    const t = await this.toastCtrl.create({
                        message: msg,
                        duration: 2000,
                        color: 'danger',
                    });
                    t.present();
                } finally {
                    loader.dismiss();
                }
            },
            },
        ],
        });

        await alert.present();
    }

    async enviarACocina() {
        if (!this.carritoId) return;
        const alert = await this.alertCtrl.create({
            header: 'Enviar a cocina',
            message: '¿Confirmas enviar este pedido a cocina?',
            buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Enviar',
                handler: async () => {
                const loader = await this.loadingCtrl.create({ message: 'Enviando...' });
                await loader.present();
                try {
                    const resp = await firstValueFrom(
                    this.meseroSrv.enviarACocina(this.carritoId!)
                    );

                    // Limpiamos carrito local
                    this.carrito = null;
                    this.carritoId = undefined;

                    const t = await this.toastCtrl.create({
                    message: `Enviado a cocina (Pedido #${resp.id})`,
                    duration: 2000,
                    color: 'success',
                    });
                    t.present();

                    // Ir al detalle del pedido EN_PROCESO
                    this.router.navigate(['/mesero/mis-pedidos', resp.id]);
                } catch (err: any) {
                    const msg = err?.error?.message || 'No se pudo enviar a cocina';
                    const t = await this.toastCtrl.create({
                    message: msg,
                    duration: 2000,
                    color: 'danger',
                    });
                    t.present();
                } finally {
                    loader.dismiss();
                }
                },
            },
            ],
        });

        await alert.present();
    }

    async limpiarCarrito() {
        if (!this.carritoId) return;

        const alert = await this.alertCtrl.create({
            header: 'Limpiar carrito',
            message: 'Esto eliminará el carrito, sus items y liberará la mesa. ¿Continuar?',
            buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Limpiar',
                role: 'destructive',
                handler: async () => {
                const loader = await this.loadingCtrl.create({ message: 'Limpiando carrito...' });
                await loader.present();
                try {
                    await firstValueFrom(this.meseroSrv.limpiarCarrito(this.carritoId!));
                    this.carrito = null;
                    this.carritoId = undefined;
                    const t = await this.toastCtrl.create({
                    message: 'Carrito limpiado y mesa libre',
                    duration: 1800,
                    color: 'success',
                    });
                    t.present();
                } catch (err: any) {
                    const msg = err?.error?.message || 'No se pudo limpiar el carrito';
                    const t = await this.toastCtrl.create({
                    message: msg,
                    duration: 2000,
                    color: 'danger',
                    });
                    t.present();
                } finally {
                    loader.dismiss();
                }
                },
            },
            ],
        });

        await alert.present();
    }

    get totalCarrito() {
        if (!this.carrito?.items?.length) return 0;
        return this.carrito.items.reduce(
            (acc, it) => acc + it.precioUnitario * it.cantidad,
            0
        );
    }

}
