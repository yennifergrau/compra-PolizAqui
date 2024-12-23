import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { bankOption } from 'src/app/interface/syPagoBank';
import { OccidentalService } from 'src/app/services/occidental.service';
import { SypagoService } from 'src/app/services/sypago.service';

@Component({
  selector: 'app-pago-occidental',
  templateUrl: './pago-occidental.page.html',
  styleUrls: ['./pago-occidental.page.scss'],
})
export class PagoOccidentalPage implements OnInit {
 
  public metodoPago: string = '';
  public countOption: string = '';
  public formSyPago!: FormGroup;
  public showLoading: boolean = false;
  public isModalVisible: boolean = false;
  public paymentData: any;
  public precio : any;
  public Descripcion_occidental :any
  public dataOtp : any
  public bank : bankOption [] = [];

  constructor(
    private occidentalService: OccidentalService,
    private fb: FormBuilder,
    private botonPagoService: SypagoService,
    private toastController: ToastController
  ) {this.generateForm()}

  ngOnInit() {
    this.getStoragedData()
    setTimeout(() => {
      this.BankOption();
    }, 4000);
    const info = JSON.parse(localStorage.getItem('cedula-payment') || '[]')
    this.formSyPago.patchValue({
    numid:info
    })
  }

  public togglePaymentFields(event: any): void {
    this.metodoPago = event.target.value;
    this.countOption = this.metodoPago === 'telefono' ? 'CELE' : 'CNTA';
    this.formSyPago.get('type_inst')?.setValue(this.countOption) 
  }

  private generateForm() {
    this.formSyPago = this.fb.group({
      idepol : new FormControl (''),
      numpol: new FormControl (''),
      codinter: new FormControl ('060001'),
      typeid: new FormControl ('',Validators.required),
      numid: new FormControl ('',Validators.required),
      type_inst : new FormControl (''),
      instrument: new FormControl ('',Validators.required),
      bank_code: new FormControl ('',Validators.required),
      pay_amt: new FormControl (''),
      currency: new FormControl ('VES')
    })
  }

  private getStoragedData() : void {
    this.Descripcion_occidental = JSON.parse(localStorage.getItem('plan') || '[]');
    const idP = JSON.parse(localStorage.getItem('occidental_poliza') || '[]');
    this.precio = parseInt(idP.prima, 10);
    this.formSyPago.get('pay_amt')?.setValue(this.precio)
    this.formSyPago.get('idepol')?.setValue(idP.idepol)
    this.formSyPago.get('numpol')?.setValue(idP.numpol)
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

  closeModal() {
    this.isModalVisible = false;
  }
    public async submit() {
      this.showLoading = true;
      if (this.formSyPago.valid) {
        try {
          this.dataOtp = this.formSyPago.value
          const response = await (await this.occidentalService.getSavePayment(this.formSyPago.value)).toPromise();
            this.isModalVisible = true
        } catch (error) {
          console.error('Error al procesar el OTP:', error);
          this.toastMessage('Hubo un error al procesar el OTP','alert-circle',2800,'danger');
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
      this.bank = response.filter((item: { IsDebitOTP: any; }) => item.IsDebitOTP);
    } catch (error) {
      console.error('Error al obtener las opciones de banco:', error);
    }
  }
  
  
}
