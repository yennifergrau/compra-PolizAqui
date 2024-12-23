import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { log } from 'console';
import { bankOption, PLan } from 'src/app/interface/syPagoBank';
import { SypagoService } from 'src/app/services/sypago.service';

@Component({
  selector: 'app-pago-mundial',
  templateUrl: './pago-mundial.page.html',
  styleUrls: ['./pago-mundial.page.scss'],
})
export class PagoMundialPage implements OnInit {

  public metodoPago!: string;
  public countOption!: string;
  public informacionPago: PLan | null = null;
  public formSyPago!: FormGroup;
  public showLoading: boolean = false;
  public isModalVisible: boolean = false;
  public paymentData: string | any ;
  // private countBank : string = '01720111531118494549'; 
  // private codeBank : string = '0172'
  private countBank : string = '01143600524083976037';
  private codeBank : string = '0114'
  public opcionBancos : bankOption [] = [];
  public  informacionProducto !: string | any;
  private precioPlan !:string;
  public  precioTasa !: any;
  public  montoRetorno !:string | any;
  public planApagar !: string
  public payt:any
  public precioApagar !: string

  constructor(
    private botonPagoService: SypagoService,
    private fb: FormBuilder,
    private toastController: ToastController

  ) {this.authSyPago(),this.generateForm()}

  ngOnInit() {
    this.localStorage();
    const informacionProducto = JSON.parse(localStorage.getItem('Descripcion_products') || '[]')
    const precioPLan = JSON.parse(localStorage.getItem('price') || '[]')
    const informacionRetornoPoliza = JSON.parse(localStorage.getItem('paymentRetorno') || '[]')
    this.montoRetorno = informacionRetornoPoliza.monto;
    this.planApagar = informacionRetornoPoliza.plan;
    this.informacionProducto = informacionProducto 
    this.precioPlan = precioPLan 
    Promise.all([this.getInfoTasa(), this.BankOption()])
    .then(() => {
      this.showLoading = false;
    })
    .catch((error) => {
      this.showLoading = false;
    });
  }

  public togglePaymentFields(event: any): void {
    this.metodoPago = event.target.value;
    this.countOption = this.metodoPago === 'telefono' ? 'CELE' : 'CNTA';
  }

  private generateForm() {
    this.formSyPago = this.fb.group({
      numberCedula : new FormControl ('',Validators.required),
      typeCedula: new FormControl ('',Validators.required),
      bank_code: new FormControl ('',Validators.required),
      numeroCuentaT: new FormControl ('',Validators.required)
    })
  }

  private localStorage() {
    const informacionPlan = JSON.parse(localStorage.getItem('infoPlan') || '[]')  
    if (informacionPlan) {
      this.informacionPago = informacionPlan;         
    }
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
  private async authSyPago() {
    try {
      const response = await this.botonPagoService.authToken();
    } catch (error) {
      console.error('Error al obtener el token de autenticación:', error);
    }
  }


  private async getInfoTasa() {
    this.showLoading = true;
    try {
      const response = await this.botonPagoService.getTasaBank();
      const precio: number = this.informacionPago?.costo_anual ? Number(this.informacionPago.costo_anual) : 0;
      const precioRetorno = isNaN(parseFloat(this.montoRetorno)) ? 0 : parseFloat(this.montoRetorno);
      const tasa = response[0].rate;
      if (tasa && !isNaN(tasa)) {
        this.precioTasa = (precio * tasa).toFixed(2);
        this.payt = (precioRetorno * tasa).toFixed(2);
        this.precioApagar = (this.precioTasa | this.payt).toFixed(2);
        console.log(this.precioApagar);     
      } 
    } catch (error) {
      console.log('error al obtener la tasa', error);
    } finally {
      this.showLoading = false;
    }
  }

  public closeModal() {
    this.isModalVisible = false;
  }
  public async submit() {
    this.showLoading = true;
     if (this.formSyPago.valid) {
        try {
          await this.authSyPago();
          this.paymentData = {
            "creditor_account": {
              "bank_code": this.codeBank,
              'type': 'CNTA',
              "number": this.countBank
            },
            "debitor_document_info": {
              'type': this.formSyPago.get('typeCedula')?.value,
              'number': this.formSyPago.get('numberCedula')?.value
            },
            "debitor_account": {
              "bank_code": this.formSyPago.get('bank_code')?.value,
              "type": this.countOption,
              "number": this.formSyPago.get('numeroCuentaT')?.value
            },
            "amount": {
              "amt": parseFloat(this.precioApagar),
              "currency": "VES"
            }
          };

          const response = await this.botonPagoService.realizarPago(this.paymentData);
          this.isModalVisible = true
                      
        } catch (error) {
          console.error('Error al procesar el OTP:', error);
          this.toastMessage('Hubo un error al procesar el pago','alert-circle',2800,'danger');
        } finally {
          this.showLoading = false;
        }
      } else {
        this.formSyPago.markAllAsTouched()
        this.toastMessage('Completa todos los campos','alert-circle',2800,'danger');
        this.showLoading = false;
      }
    }

  public async BankOption() {
    try {
      const response = await this.botonPagoService.bankOptions();
      this.opcionBancos = response.filter((item: { IsDebitOTP: any; }) => item.IsDebitOTP);
    } catch (error) {
      console.error('Error al obtener las opciones de banco:', error);
    }
  }
  
  
}
