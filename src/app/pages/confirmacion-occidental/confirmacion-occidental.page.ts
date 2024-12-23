import { Component, inject, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-confirmacion-occidental',
  templateUrl: './confirmacion-occidental.page.html',
  styleUrls: ['./confirmacion-occidental.page.scss'],
})
export class ConfirmacionOccidentalPage implements OnInit {
  
  public showLoading : boolean = false;
  private poliza: string | any;
  public isDisabled = true;

  constructor(
    private toastController: ToastController,
    private navController: NavController,
    private notificacionService: NotificationService
  ) {}

  ngOnInit() {
    this.showLoading = true
    this.requestNotification();
    setTimeout(() => {
      this.isDisabled = false;
      this.showLoading = false
      this.storageService();
    }, 6000);
  }
  private async toastMessage(message: string, icon: string, duration: number,color:string) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: 'top',
      icon: icon,
      color:color,
      buttons: [
        {
          text: 'Ok',
        }
      ]
    });
    await toast.present();
  }
  async downloadPDF() {
    if (this.poliza) {
      const link = document.createElement('a');
      link.href = this.poliza;
      link.download = 'poliza.pdf';
      link.target = '_blank';
      link.click();
      this.toastMessage('Archivo descargado exitosamente','checkmark-circle',2800,'success');
    } else {
      this.toastMessage('No se pudo encontrar la URL de la póliza.','alert-circle',2800, 'danger');
    }
  }

  private requestNotification(): void {
    const notificationData = {
      title: '¡Gracias por Preferir PolizAqui! 😁',
      message: `Gracias por tu compra en PolizAqui! Tu póliza ha sido emitida y enviada a tu correo.`,
    };
    this.notificacionService.sendNotification(notificationData);
  }

  private storageService() {
    const informacionPoliza = JSON.parse(localStorage.getItem('poliza') || '[]') 
    if (informacionPoliza) {
      this.poliza = informacionPoliza      
    }
  }

  public routingNavigate() {
    localStorage.clear()
    this.navController.navigateRoot(['b4d9ef72dc4a9b91e8a1d6b9d1a423a7']).then(() => {
      window.location.reload();
    });
  }
}
