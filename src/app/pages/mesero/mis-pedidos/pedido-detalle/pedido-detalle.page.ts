import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    IonicModule,
    AlertController,
    LoadingController,
    ToastController,
    ModalController,
} from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MeseroService } from 'src/app/core/services/mesero.service';
import { PedidoDetalle, PedidoItem } from 'src/app/core/models/mesero.models';
import { ProductoPickerModal } from '../../pedidos/producto-picker/producto-picker.modal';
import { MeseroPickerModal } from 'src/app/shared/mesero-picker/mesero-picker.modal';

@Component({
    standalone: true,
    selector: 'app-pedido-detalle-mesero',
    templateUrl: './pedido-detalle.page.html',
    styleUrls: ['./pedido-detalle.page.scss'],
    imports: [CommonModule, IonicModule],
})
export class PedidoDetallePage implements OnInit {
    private route       = inject(ActivatedRoute);
    private meseroSrv   = inject(MeseroService);
    private loadingCtrl = inject(LoadingController);
    private toastCtrl   = inject(ToastController);
    private alertCtrl   = inject(AlertController);
    private modalCtrl   = inject(ModalController);

    pedidoId!: number;
    pedido: PedidoDetalle | null = null;

    get editable() {
        return this.pedido?.estado === 'EN_PROCESO';
    }

    get itemCount() {
        return this.pedido?.items?.length ?? 0;
    }

    get extraCount() {
        return this.pedido?.items?.filter(i => i.isExtra)?.length ?? 0;
    }

    async ngOnInit() {
        this.pedidoId = Number(this.route.snapshot.paramMap.get('id'));
        await this.cargar();
    }

    async cargar(event?: any) {
        try {
            this.pedido = await firstValueFrom(
                this.meseroSrv.getPedido(this.pedidoId)
            );
        } catch (err: any) {
            const msg = err?.error?.message || 'Error al cargar pedido';
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

    // === Extras (isExtra = true) ===
    async agregarExtra() {
        if (!this.editable) return;
        const modal = await this.modalCtrl.create({
            component: ProductoPickerModal,
        });

        await modal.present();
        const { data, role } = await modal.onWillDismiss();
        if (role !== 'ok' || !data?.producto) return;

        const prod = data.producto as { id: number; nombre: string };

        const alert = await this.alertCtrl.create({
        header: `Agregar extra: ${prod.nombre}`,
        inputs: [
            { name: 'cantidad', type: 'number', value: 1, placeholder: 'Cantidad' },
            { name: 'notas', type: 'text', placeholder: 'Notas (opcional)' },
        ],
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
            text: 'Agregar',
            handler: async (d) => {
                const loader = await this.loadingCtrl.create({ message: 'Agregando extra...' });
                await loader.present();
                try {
                    await firstValueFrom(
                        this.meseroSrv.addPedidoItem(this.pedidoId, {
                        productoId: prod.id,
                        cantidad: Number(d.cantidad || 1),
                        notas: d.notas || undefined,
                        isExtra: true, // 👈 SIEMPRE extra
                        })
                    );
                    await this.cargar();
                    const t = await this.toastCtrl.create({
                        message: 'Extra agregado',
                        duration: 1500,
                        color: 'success',
                    });
                    t.present();
                } catch (err: any) {
                    const msg = err?.error?.message || 'No se pudo agregar el extra';
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

    async editarItem(it: PedidoItem) {
        if (!this.editable) return;

        const alert = await this.alertCtrl.create({
        header: 'Editar item',
        inputs: [
            { name: 'cantidad', type: 'number', value: it.cantidad, placeholder: 'Cantidad' },
            { name: 'notas', type: 'text', value: it.notas ?? '', placeholder: 'Notas' },
        ],
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
            text: 'Guardar',
            handler: async (d) => {
                const loader = await this.loadingCtrl.create({ message: 'Actualizando...' });
                await loader.present();
                try {
                await firstValueFrom(
                    this.meseroSrv.editPedidoItem(this.pedidoId, it.id, {
                    cantidad: Number(d.cantidad),
                    notas: d.notas,
                    })
                );
                await this.cargar();
                } catch (err: any) {
                const msg = err?.error?.message || 'Error al actualizar item';
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

    async eliminarItem(it: PedidoItem) {
        if (!this.editable) return;

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
                    this.meseroSrv.removePedidoItem(this.pedidoId, it.id)
                );
                await this.cargar();
                } catch (err: any) {
                const msg = err?.error?.message || 'Error al eliminar item';
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

    async transferirPedido() {
        if (!this.editable || !this.pedido) return;
        // 1) Abrir modal de selección de mesero
        const modal = await this.modalCtrl.create({
            component: MeseroPickerModal,
        });

        await modal.present();
        const { data, role } = await modal.onWillDismiss();

        if (role !== 'ok' || !data?.mesero) return;

        const mesero = data.mesero as { id: number; nombre: string };

        // 2) Confirmar transferencia
        const confirm = await this.alertCtrl.create({
            header: 'Transferir pedido',
            message: `¿Transferir el pedido al mesero ${mesero.nombre}?`,
            buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Transferir',
                handler: async () => {
                const loader = await this.loadingCtrl.create({ message: 'Transfiriendo...' });
                await loader.present();
                try {
                    await firstValueFrom(
                        this.meseroSrv.transferirPedido(this.pedidoId, mesero.id)
                    );
                    const t = await this.toastCtrl.create({
                    message: 'Pedido transferido correctamente',
                    duration: 1800,
                    color: 'success',
                    });
                    t.present();
                } catch (err: any) {
                    const msg = err?.error?.message || 'No se pudo transferir el pedido';
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

        await confirm.present();
    }


}
