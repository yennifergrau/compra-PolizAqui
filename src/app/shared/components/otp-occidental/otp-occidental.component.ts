import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { NotificationService } from 'src/app/services/notification.service';
import { OccidentalService } from 'src/app/services/occidental.service';
import { SypagoService } from 'src/app/services/sypago.service';

@Component({
  selector: 'app-otp-occidental',
  templateUrl: './otp-occidental.component.html',
  styleUrls: ['./otp-occidental.component.scss'],
})
export class OtpOccidentalComponent  implements OnInit {
  @Input() isVisible: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Input()  dataOtp:any;
  public otp: string[] = [];
  public otpLength: number = 6;
  public showLoading: boolean = false;
  private idtransaction : any
  private informacionCorreo: any;
  private poliza : any; 

  constructor(
    private toastController: ToastController,
    private occidentalService: OccidentalService,
    private notifiacionService: NotificationService,
    private botonPagoService: SypagoService,
    private navController: NavController
  ) {

  }
  ngOnInit() {
    this.setOtpLength(8);   
    this.informacionCorreo = JSON.parse(localStorage.getItem('Correo_Poliza') || '[]')
  }

  public setOtpLength(length: number, event?: Event) {
    if (event) {event.stopPropagation()}
    this.otpLength = length;
    this.otp = Array(length).fill('');
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

  public close() {
    this.clearOtp();
    this.closeModal.emit();
  }

  public moveFocus(event: any, nextInputId: string) {
    const currentInput = event.target as HTMLInputElement;
    const value = currentInput.value;
    if (value.length === 1) {
      const nextInput = document.querySelector(`#${nextInputId}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  public handleBackspace(event: any, currentInputId: string) {
    const currentInput = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && currentInput.value.length === 0) {
      const currentIndex = parseInt(currentInputId.replace('otp', ''), 10) - 1;
      if (currentIndex > 0) {
        const prevInputId = 'otp' + currentIndex;
        const prevInput = document.querySelector(`#${prevInputId}`) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
          this.otp[currentIndex - 1] = '';
        }
      }
    }
  }

  public clearOtp() {
    this.otp = Array(this.otpLength).fill('');
  }

  public async Submit() {
    this.showLoading = true;
    const otpCode = this.otp.join('').trim();   
    if (otpCode.length !== this.otpLength) {
      alert(`El código OTP debe tener exactamente ${this.otpLength} dígitos.`);
      return;
    }
    try {
      const data  = {
        idepol:this.dataOtp.idepol,
        numpol: this.dataOtp.numpol,
        codinter:this.dataOtp.codinter,
        typeid:this.dataOtp.typeid,
        numid:this.dataOtp.numid,
        type_inst:this.dataOtp.type_inst,
        instrument:this.dataOtp.instrument,
        bank_code:this.dataOtp.bank_code,
        pay_amt:this.dataOtp.pay_amt,
        currency:this.dataOtp.currency,
        code_OTP:otpCode,
        client_name:'PolizAqui'
      }
     const response = await ( await this.occidentalService.postPayment(data)).toPromise();     
      this.idtransaction = response.transaction_Id     
      this.notificacionSend();
    } catch (error) {
    } 
  }

  public isOtpComplete(): boolean {
    return this.otp.length === this.otpLength && this.otp.every(value => value !== '');
  }

  private notificacionSend() {
    const datos = {
      transaction_ID:this.idtransaction
    };
    this.occidentalService.verifyPayment(datos).subscribe(data => {      
      switch (data.status) {
        case "ACCP":
          this.previewPoliza();     
          setTimeout(() => {
            this.registerPayment();
            this.toastMessage('Pago realizado exitosamente','checkmark-circle',2800, 'success');
            this.requestNotification()
            this.navController.navigateRoot('confirmacion-occidental');
          }, 8000);
          break;
        case "RJCT":
          this.toastMessage('Operación rechazada','alert-circle',2800,'danger');
          this.showLoading = false
          this.close()
          break;
  
        case "PEND":
          // this.toastMessage('Pago pendiente de pago. Por favor verifique sus cuentas.', 'information-circle',2800,'warning');
          break;

          case 'PROC':
            // this.toastMessage('Pago en proceso. Recibirás una notificación una vez completado.', 'warning');
            break;
  
        default:
          this.toastMessage('Estado de la operación desconocido. Contacte soporte.','alert-circle',2800,'danger');
          break;
      }
    });
  }

  private async previewPoliza() {
    try{
      const data = {
        idepol: this.dataOtp.idepol,
        canal:'MOBILE'
      }
      const response = await this.occidentalService.viewPoliza(data).toPromise();  
      this.poliza = response.downloadLink
      localStorage.setItem('poliza',JSON.stringify(this.poliza))
      this.sendPoliza();
    }catch(err){
    }
  }

  private async  sendPoliza(){
    const data = {
      correo_titular: this.informacionCorreo.correo_titular,
      poliza: this.informacionCorreo.numero_poliza,
      fecha_emision: this.informacionCorreo.fecha_emision,
      nombre_titular: this.informacionCorreo.nombre_titular,
      fecha_cobro: this.informacionCorreo.fecha_cobro,
      urlpoliza: this.poliza,
      fecha_inicio: this.informacionCorreo.fecha_inicio,
      numero_Poliza: this.informacionCorreo.numero_Poliza,
      fecha_vencimiento: this.informacionCorreo.fecha_vencimiento,
    }
    const response = await this.occidentalService.sendMail(data).toPromise();
  }
  
  private requestNotification(): void {
    const notificationData = {
      title: 'PolizAqui te informa 📢',
      message: `¡Pago recibido! Tu póliza está ahora activa. Consulta tu correo para más detalles.`
     };
    this.notifiacionService.sendNotification(notificationData);
  }
  

  private getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const seconds = String(today.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  private async registerPayment() {
    const data = {
      numero_poliza: parseInt(this.dataOtp.numpol),
      monto_pago: this.dataOtp.pay_amt,
      fecha_pago: this.getCurrentDate(),
      metodo_pago: this.dataOtp.type_inst,
      referencia: this.idtransaction,
      banco: this.dataOtp.instrument,
      sypago: this.dataOtp,
      transaction_id: this.idtransaction,
      status: true,
      email: this.informacionCorreo.correo_titular,
      aliado: 'La Occidental',
      plan: 'RCV AUTO'
    };

    try {
      const response = await this.occidentalService.registerPayment(data).toPromise();
    } catch (error) {
      console.error('Error durante el registro del pago:', error);
    }
  }
  public getTipoTransaccion(type:any) {
    switch (type) {
      case 'CELE':
        return 'Pago Móvil';
      case 'CNTA':
        return 'Cuenta Bancaria';
      default:
        return 'Desconocido';
    }
  }

}
