import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { InserDataService } from 'src/app/services/inser-data.service';
import { PolizaService } from 'src/app/services/poliza.service';
import { SypagoService } from 'src/app/services/sypago.service';
import { environment } from 'src/environments/environment';
import {jwtDecode} from 'jwt-decode'
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss'],
})
export class OtpComponent implements OnInit {

  @Input() isVisible: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Input() paymentData: any;
  public otp: string[] = [];
  public otpLength: number = 6;
  public showLoading: boolean = false;
  // private countBank : string = '01720111531118494549'; 
  // private codeBank : string = '0172'
  private countBank : string = '01143600524083976037';
  private codeBank : string = '0114'
  private idtransaction: string = '';
  private opt: any;
  private id_ruta !: string;
  private numero_Poliza : any;
  private email : string | any;
  private descipcionPlan !: string;
  private idPoliza : string | any;
  private numeroObtenido : string | any;
  private numeroPoliza : string | any;
  private poliza : string |any;
  private statusPoliza !:string | any;
  private datosPoliza: any
  private datosPolizaRcv : any 

  constructor(
    private botonPagoService: SypagoService,
    private toastController: ToastController,
    private navController: NavController,
    private mundialService: PolizaService,
    private registroInformacionService: InserDataService,
    private http: HttpClient,
    private notificacionService: NotificationService
  ){}
  ngOnInit() {
    const informacionPlan = JSON.parse(localStorage.getItem('Descripcion_products') || '[]');
    const numeroObtenido = JSON.parse(localStorage.getItem('currentPolizaNumber') || '[]')
    this.datosPoliza = JSON.parse(localStorage.getItem('Datos-poliza-mundial') || '[]')
    this.datosPolizaRcv = JSON.parse(localStorage.getItem('Datos-poliza-mundial-rcv') || '[]')
    const id_ruta = JSON.parse(localStorage.getItem('id-routing') || '[]')
    this.numeroObtenido = JSON.parse(localStorage.getItem('numero') || '[]') 
    const paymentRetorno = JSON.parse(localStorage.getItem('paymentRetorno') || '[]')
    this.descipcionPlan = informacionPlan;
    this.numero_Poliza = numeroObtenido
    this.id_ruta = id_ruta
    this.setOtpLength(8);
    this.extractEmail();
    this.poliza = paymentRetorno.numero_poliza
  } 

  public setOtpLength(length: number, event?: Event) {
    if (event) {event.stopPropagation();}
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


  private extractEmail() {
  const informacionUsuario = JSON.parse(localStorage.getItem('auth-session') || '[]');
    if (informacionUsuario) {
      try {
        const parsedData = informacionUsuario;
        const tokenDecodificado: any = jwtDecode(parsedData.infoUser)
        this.email = tokenDecodificado.email
      } catch (error) {
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

  private sumarUnAno(): Date {
    const fechaActual = new Date();
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setFullYear(fechaActual.getFullYear() + 1);
    return nuevaFecha;
  }
  private async mundialRegisterPayment(){
    const datos = {
      poliza:this.numeroObtenido,
      recibo:this.idtransaction,
      monto: this.paymentData.amount.amt,
      referencia:this.idtransaction,
      moneda:'BS',
      fecha_cobro:this.getCurrentDate()
    }    
    const response = await (await this.mundialService.registerMundialPayment(datos)).toPromise()     
  }

  public async Submit() {
    this.showLoading = true;
    const otpCode = this.otp.join('').trim(); 
    if (otpCode.length !== this.otpLength) {
      alert(`El código OTP debe tener exactamente ${this.otpLength} dígitos.`);
      this.showLoading = false;
      return;
    }
    const datos = {
      "internal_id": '1234567890',
      "group_id": '9876543210',
      "account": {
        "bank_code": this.codeBank,
        "type": "CNTA",
        "number": this.countBank
      },
      "amount": {
        "amt": this.paymentData.amount.amt,
        "currency": "VES"
      },
      "concept": "Cobro de Poliza",
      "notification_urls": {
        "web_hook_endpoint": 'https://syPagoMundial.polizaqui.com/getNotifications'
      },
      "receiving_user": {
        "otp": otpCode,
        "document_info": {
          "type": this.paymentData.debitor_document_info.type,
          "number": this.paymentData.debitor_document_info.number
        },
        "account": {
          "bank_code": this.paymentData.debitor_account.bank_code,
          "type": this.paymentData.debitor_account.type,
          "number": this.paymentData.debitor_account.number
        }
      }
    };
  
    try {
      const response = await firstValueFrom(this.botonPagoService.verifyCodeOTP(datos));
      this.idtransaction = response.transaction_id;
      this.notificacionSend();
    } catch (error) {
      this.toastMessage('Hubo un error al procesar el OTP','alert-circle',2800,'danger');
      this.showLoading = false
    }
  }
  
  public isOtpComplete(): boolean {
    return this.otp.length === this.otpLength && this.otp.every(value => value !== '');
  }

  private async notificacionSend() {
    const datos = { id_transaction: this.idtransaction };
    let polizaGenerada = false;
    let polizaRcvGenerada = false;
  
    const interval = setInterval(() => {
      this.botonPagoService.getNotification(datos).subscribe({
        next: async (data) => {
          try {
            switch (data.data.status) {
              case "ACCP":
                try {
                  const polizaExitosa = await this.withTimeout(this.generatePoliza(), 6000);
                  if (polizaExitosa) {
                    polizaGenerada = true;
                  }
                } catch (error: any) {
                  console.error('Error o timeout en generatePoliza:', error.message);
                  polizaGenerada = false;
                }
  
                if (!polizaGenerada) {
                  try {
                    const rcvExitosa = await this.withTimeout(this.generatePolizaRcv(), 6000);
                    if (rcvExitosa) {
                      polizaRcvGenerada = true;
                    }
                  } catch (error: any) {
                    console.error('Error o timeout en generatePolizaRcv:', error.message);
                    polizaRcvGenerada = false;
                  }
                }
  
                if (polizaGenerada || polizaRcvGenerada) {
                  await this.savePolizaData();
                  await this.registerPayment();
                  this.getPolizaCorreo();
                  this.sendDataService('');
                  this.requestNotification();
                  this.updatePoliza();
                  this.toastMessage(
                    'Pago realizado exitosamente',
                    'checkmark-circle',
                    2800,
                    'success'
                  );
                  await this.mundialRegisterPayment();
                  setTimeout(() => {
                    this.navController.navigateRoot(
                      '7f7d9e3d1e7b5f6a9c8b4a9d4c9d2e4a'
                    );
                  }, 4000);
                } else {
                  this.toastMessage(
                    'Error: la poliza ya se encuentra registrada',
                    'alert-circle',
                    2800,
                    'danger'
                  );
                }
                clearInterval(interval);
                break;
  
              case "RJCT":
                this.toastMessage('Operación rechazada', 'alert-circle', 2800, 'danger');
                this.registerPayment1();
                this.showLoading = false;
                this.close();
                clearInterval(interval);
                break;
  
              case "PEND":
              case "PROC":
                this.showLoading = true;
                break;
  
              default:
                this.toastMessage(
                  'Estado de la operación desconocido. Contacte soporte.',
                  'alert-circle',
                  2800,
                  'danger'
                );
                clearInterval(interval);
                break;
            }
          } catch (error: any) {
            console.log(error);
            
            this.toastMessage(
              'Ocurrió un error inesperado. Operación detenida.',
              'alert-circle',
              2800,
              'danger'
            );
            clearInterval(interval);
          }
        },
        error: (err) => {
          this.toastMessage(
            'Error al comunicarse con el servidor. Operación detenida.',
            'alert-circle',
            2800,
            'danger'
          );
          clearInterval(interval);
        },
      });
    }, 10000);
  }
  
  public withTimeout(promise: Promise<any>, timeout: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout excedido')), timeout);
      promise
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
  
  public async generatePoliza(): Promise<boolean> {
    try {
      this.showLoading = true;
      const response = await (await this.mundialService.emisionMundial(this.datosPoliza)).toPromise();
  
      if (response.status === true) {
        this.numeroPoliza = response.data.cnpoliza;
        localStorage.setItem('cnpoliza', JSON.stringify(this.numeroPoliza));
        localStorage.setItem('urlDocumento', JSON.stringify(response.data.urlpoliza));
  
        const plan = this.descipcionPlan;
        const fecha_inicio = this.getCurrentDate();
        const fechaVencimiento = this.sumarUnAno();
        const titular = this.datosPoliza.nombre_titular;
  
        localStorage.setItem('titular', JSON.stringify(titular));
        localStorage.setItem('titularApellido', JSON.stringify(this.datosPoliza.apellido_titular));
  
        await this.emailSend({
          correo_titular: this.datosPoliza.correo_titular,
          poliza: this.numeroPoliza,
          fecha_emision: this.getCurrentDate(),
          nombre_titular: titular,
          fecha_cobro: plan,
          urlpoliza: response.data.urlpoliza,
          fecha_inicio: fecha_inicio,
          numero_Poliza: this.datosPoliza.poliza,
          fecha_vencimiento: fechaVencimiento
        });
    
        return true;
      } else {
        throw new Error('No hay datos válidos para generar la póliza.');
      }
    } catch (error: any) {
      console.error('Error en generatePoliza:', error.message);
      return false;
    } finally {
      this.showLoading = false;
    }
  }
  
  public async generatePolizaRcv(): Promise<boolean> {
    try {
      this.showLoading = true;
      const response = await (await this.mundialService.emisionMundialRcv(this.datosPolizaRcv)).toPromise();
  
      if (response.status === true) {
        this.numeroPoliza = response.data.cnpoliza;
        localStorage.setItem('cnpoliza', JSON.stringify(this.numeroPoliza));
        localStorage.setItem('urlDocumento', JSON.stringify(response.data.urlpoliza));
  
        const plan = this.descipcionPlan;
        const fecha_inicio = this.getCurrentDate();
        const fechaVencimiento = this.sumarUnAno();
        const titular = this.datosPolizaRcv.nombre_titular;
  
        localStorage.setItem('titular', JSON.stringify(titular));
        localStorage.setItem('titularApellido', JSON.stringify(this.datosPolizaRcv.apellido_titular));
  
        await this.emailSend({
          correo_titular: this.datosPolizaRcv.correo_titular,
          poliza: this.numeroPoliza,
          fecha_emision: this.getCurrentDate(),
          nombre_titular: titular,
          fecha_cobro: plan,
          urlpoliza: response.data.urlpoliza,
          fecha_inicio: fecha_inicio,
          numero_Poliza: this.datosPolizaRcv.poliza,
          fecha_vencimiento: fechaVencimiento
        });
        this.updatePoliza();
        return true;
      } else {
        throw new Error('No hay datos válidos para generar la póliza RCV.');
      }
    } catch (error: any) {
      console.error('Error en generatePolizaRcv:', error.message);
      return false;
    } finally {
      this.showLoading = false;
    }
  }
  
  private async emailSend(data: any) {
    localStorage.setItem('Correo_Poliza',JSON.stringify(data))
  }

  
  private requestNotification(): void {
    const notificationData = {
      title: '¡Gracias por Preferir PolizAqui! 😁',
      message: `Estimado usuario, su pago fue procesado con exito, no olvides descargar tu póliza`,
    };
    this.notificacionService.sendNotification(notificationData);
  }


  private async updatePoliza() {
    const dato = {
      numero_poliza:this.numeroObtenido
    }
    const response =  await this.registroInformacionService.updateStatus(dato);
  }
  
  private async getPolizaCorreo(){
    try {
        const correo = localStorage.getItem('Correo_Poliza');
        if (!correo) {
            return;
        }
        const correoData = JSON.parse(correo);
        const result = await this.http.post<any>(`${environment.mailPoliza}/send`, correoData).toPromise();
        localStorage.setItem('poliza', JSON.stringify(result));
    } catch(err) {
    }
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
    let dataEmpresa;
    try {
      dataEmpresa = JSON.parse(localStorage.getItem('empresa-aliada') || 'null');
    } catch (e) {
      dataEmpresa = 'PolizAqui';
    }
    dataEmpresa = dataEmpresa || 'PolizAqui';
    const data = {
      numero_poliza: this.numeroPoliza,
      monto_pago: this.paymentData.amount.amt,
      fecha_pago: this.getCurrentDate(),
      metodo_pago: this.paymentData.debitor_account.type,
      referencia: this.idtransaction,
      banco: this.paymentData.debitor_account.number,
      sypago: this.paymentData,
      transaction_id: this.idtransaction,
      status: true,
      email: this.email,
      aliado: 'La Mundial',
      plan: this.descipcionPlan,
      estado: 'PAGADA',
      empresa: dataEmpresa,
    };
    try {
      const response = await this.botonPagoService.registerPayment(data);
    } catch (error) {
      console.error('Error durante el registro del pago:', error);
    }
  }
  
  private  async savePolizaData() {
    const urlpoliza = JSON.parse(localStorage.getItem('urlDocumento') || '[]')
    const plan = JSON.parse(localStorage.getItem('Descripcion_products') || '[]');
    const precio = JSON.parse(localStorage.getItem('price') || '[]');
    const titular = JSON.parse(localStorage.getItem('titular') || '[]')
    const cnpoliza = JSON.parse(localStorage.getItem('cnpoliza') || '[]')
    const apellido = JSON.parse(localStorage.getItem('titularApellido') || '[]')
    const data = {
      fecha_emision:this.getCurrentDate(),
      fecha_expiracion: this.sumarUnAno(),
      estado_poliza:'PAGADA',
      documento_poliza:urlpoliza,
      email_usuario:this.email,
      coberturas:{

      },
      plan:plan,
      monto:precio,
      titular:titular,
      aseguradora:'La mundial de seguros',
      numero_poliza:cnpoliza,
      titular_apellido:apellido
    }

    const response = await (await this.registroInformacionService.savePoliza(data)).toPromise();
  }
  private async registerPayment1() {
    const data = {
      numero_poliza: this.idPoliza,
      monto_pago: this.paymentData.amount.amt,
      fecha_pago: this.getCurrentDate(),
      metodo_pago: this.paymentData.debitor_account.type,
      referencia: this.idtransaction,
      banco: this.paymentData.debitor_account.number,
      sypago: this.paymentData,
      transaction_id: this.idtransaction,
      status: true,
      email: this.email,
      aliado: 'La Mundial',
      plan: this.descipcionPlan,
      estado:'RECHAZADA'
    };
    
    try {
      const response = await  this.botonPagoService.registerPayment(data);
    } catch (error) {
      console.error('Error durante el registro del pago:', error);
    }
  }


  private async sendDataService(data: any) {
    const datos = {
      tipo_transaccion: this.getTipoTransaccion(this.paymentData.debitor_account.type),
      fecha_transaccion: this.getCurrentDate(),
      monto_transaccion: this.paymentData.amount.amt,
    };
    try {
      const response = await this.registroInformacionService.saveTransactions(datos);
    } catch (error) {
      console.error('Error al guardar la transacción:', error);
    }
  }

  getTipoTransaccion(type:any) {
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
