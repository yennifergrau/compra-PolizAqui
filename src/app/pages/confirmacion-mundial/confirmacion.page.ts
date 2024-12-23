import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-confirmacion',
  templateUrl: './confirmacion.page.html',
  styleUrls: ['./confirmacion.page.scss'],
})
export class ConfirmacionPage implements OnInit {

  public showLoading: boolean = false;
  private informacionPoliza!:string | any ;
  public isDisabled = true;
  public numerodepoliza : any
  public numeroPoliza :string | any
  public documento :string |  any;
  public link : any
  public modalFinal : boolean = false;
  public item : any

  constructor(
    private notificacionService: NotificationService,
    private navController: NavController
  ) {}

  ngOnInit() {
    this.showLoading = true
    this.requestNotification();
    setTimeout(() => {
      this.isDisabled = false;
      this.showLoading = false
      this.getStorageData();
    }, 6000);
  }


  private getStorageData() {
    const numeroPoliza = JSON.parse(localStorage.getItem('cnpoliza') || '[]');
    const documento = JSON.parse(localStorage.getItem('documento_identidad') || '[]');
    const informacionCorreo = JSON.parse(localStorage.getItem('Correo_Poliza') || '[]');
    const data1: any = localStorage.getItem('poliza');
    this.link = informacionCorreo.urlpoliza;
    this.informacionPoliza = JSON.parse(data1) || this.link
    this.numeroPoliza = informacionCorreo.numero_poliza;
    this.numerodepoliza = numeroPoliza || this.numeroPoliza;
    this.documento = documento.numero_de_cedula;
  }


  public openModal() {
    this.requestNotification();
    this.item = this.informacionPoliza.urlPoliza || this.link;
    this.modalFinal = true
  }

  public closeModal(){
    this.modalFinal = false;
  }

  private requestNotification(): void {
    const notificationData = {
      title: '¡Gracias por Preferir PolizAqui! 😁',
      message: `Estimado usuario, agradecemos sinceramente que hayas elegido nuestro servicio. 
      No olvides descargar tu póliza desde tu correo electrónico para obtener todos los detalles o del boton compartir.
      Si tienes alguna pregunta, no dudes en contactarnos. ¡Gracias por tu confianza!`,
    };
    this.notificacionService.sendNotification(notificationData);
  }

 
  public routingNavigate() {
    localStorage.clear()
    this.navController.navigateRoot(['b4d9ef72dc4a9b91e8a1d6b9d1a423a7']).then(() => {
      window.location.reload();
    });
  }
}
