import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { jwtDecode } from 'jwt-decode';
import {  Subscription } from 'rxjs';
import { Ciudad, Estado, estados } from 'src/app/interface/formulario.3en1';
import { InserDataService } from 'src/app/services/inser-data.service';
import { PolizaService } from 'src/app/services/poliza.service';
import { SypagoService } from 'src/app/services/sypago.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-plan-salud',
  templateUrl: './plan-salud.page.html',
  styleUrls: ['./plan-salud.page.scss'],
})
export class PlanSaludPage implements OnInit, OnDestroy, AfterViewChecked {

  public isTitularDisabled = false;
  public formPlanSalud!: FormGroup;
  private tomadorSubscription: Subscription = new Subscription();
  public estados: Estado[] = estados;
  public filteredEstados: Estado[] = [];
  public filteredEstados2: Estado[] = [];
  public showLoading = false;
  private http = inject(HttpClient)
  public ciudad : Ciudad [] = []
  public filteredCiudades: Ciudad[] =[]
  public filteredCiudades2: Ciudad[] =[]
  private descripcion:string = ''
  private currentPolizaNumber!: number;  
  private numeroObtenido : any
  private email : any;
  public verificarCorreoControl: FormControl = new FormControl('');
  public correoNoCoincide: boolean = false;
  public correoCoincide: boolean = false
  public isSecondCheckboxChecked = false;

  constructor(
    private fb: FormBuilder,
    private changeDftc: ChangeDetectorRef,
    private toastController: ToastController,
    private navController: NavController,
    private mundialService: PolizaService,
    private botonPagoService: SypagoService
  ) { 
    this.generateForm();
    this.formPlanSalud.get('dec_term_y_cod')?.valueChanges.subscribe((value: boolean) => {
      this.formPlanSalud.get('dec_term_y_cod')?.setValue(value ? 1 : 0, { emitEvent: false });
    });
    this.formPlanSalud.get('dec_diagnos_enferm')?.valueChanges.subscribe((value: boolean) => {
      this.formPlanSalud.get('dec_diagnos_enferm')?.setValue(value ? 1 : 0, { emitEvent: false });
    });
    this.formPlanSalud.get('dec_persona_politica')?.valueChanges.subscribe((value: boolean) => {
      this.formPlanSalud.get('dec_persona_politica')?.setValue(value ? 1 : 0, { emitEvent: false });
    }); 
  }

  public toggleTextarea() {
    this.isSecondCheckboxChecked = !this.isSecondCheckboxChecked;
  }

  public toggleCheckboxes(selectedId: string, otherId: string) {
    const selectedCheckbox = document.getElementById(selectedId) as HTMLInputElement;
    const otherCheckbox = document.getElementById(otherId) as HTMLInputElement;
    if (selectedCheckbox.checked) {
      otherCheckbox.checked = false;
    }
  }
  public verificarCoincidencia(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const correoVerificado = inputElement.value;
    const correoTomador = this.formPlanSalud.get('correo_tomador')?.value;
    this.correoNoCoincide = correoTomador !== correoVerificado;
    this.correoCoincide = correoTomador === correoVerificado;
  }
  
  ngAfterViewChecked() {
    this.changeDftc.detectChanges();
  }

  public DescripcionT(): string {
    const estadoNumero = this.formPlanSalud.get('estado_tomador')?.value;
    const estado = this.estados.find(e => e.cestado === estadoNumero);
    return estado ? estado.xdescripcion_l : '';
  }

  public EstadoT(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredEstados = this.estados.filter(estado =>
      estado.xdescripcion_l.toLowerCase().includes(inputValue)
    );
  
    // Limpiar las ciudades cuando cambia el estado
    this.filteredCiudades = [];
    this.formPlanSalud.get('ciudad_tomador')?.setValue('');
  
    // Si no hay coincidencias, marcar el campo como inválido
    if (this.filteredEstados.length === 0 || 
        !this.filteredEstados.some(estado => estado.xdescripcion_l.toLowerCase() === inputValue)) {
      this.formPlanSalud.get('estado_tomador')?.setErrors({ invalid: true });
    } else {
      this.formPlanSalud.get('estado_tomador')?.setErrors(null);
    }
  }
  

  
  public selectEstadoT(estado: Estado): void {
    this.formPlanSalud.get('estado_tomador')?.setValue(estado.cestado.toString());
    this.formPlanSalud.get('estado_tomador')?.markAsTouched();
    this.filteredEstados = [];
    const inputElement = document.querySelector('input[formControlName="estado_tomador"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = estado.xdescripcion_l;
    }
    this.filteredCiudades = this.ciudad.filter(ciudad => ciudad.cestado === estado.cestado);
  }

  public onCiudadT(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
    const estadoSeleccionado = this.formPlanSalud.get('estado_tomador')?.value;
    const estado = this.estados.find(e => e.cestado === Number(estadoSeleccionado));
    if (!estado) {
      this.filteredCiudades = [];
      return;
    }
  
    if (inputValue === '') {
      this.filteredCiudades = this.ciudad.filter(ciudad => ciudad.cestado === estado.cestado);
    } else {
      this.filteredCiudades = this.ciudad.filter(ciudad =>
        ciudad.xdescripcion_l.toLowerCase().includes(inputValue) &&
        ciudad.cestado === estado.cestado
      );
    }
  
    // Validar que la ciudad seleccionada esté en la lista
    if (this.filteredCiudades.length === 0 || 
        !this.filteredCiudades.some(ciudad => ciudad.xdescripcion_l.toLowerCase() === inputValue)) {
      this.formPlanSalud.get('ciudad_tomador')?.setErrors({ invalid: true });
    } else {
      this.formPlanSalud.get('ciudad_tomador')?.setErrors(null);
    }
  }
  
  
  public selectCiudadT(ciudad: Ciudad): void {
    this.formPlanSalud.get('ciudad_tomador')?.setValue(ciudad.cciudad);
    this.formPlanSalud.get('ciudad_tomador')?.markAsTouched();
    this.filteredCiudades = [];
    const inputElement = document.querySelector('input[formControlName="ciudad_tomador"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = ciudad.xdescripcion_l;
    }
  }
  
  public getCiudadDescripcion(): string {
    const ciudadNumero = this.formPlanSalud.get('ciudad_tomador')?.value;
    const ciudad = this.ciudad.find(c => c.cciudad === ciudadNumero);
    return ciudad ? ciudad.xdescripcion_l : '';
  }

  public DescripcionTI(): string {
    const estadoNumero = this.formPlanSalud.get('estado_titular')?.value;
    const estado = this.estados.find(e => e.cestado === estadoNumero);
    return estado ? estado.xdescripcion_l : '';
  }
  
  public EstadoTI(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredEstados2 = this.estados.filter(estado =>
      estado.xdescripcion_l.toLowerCase().includes(inputValue)
    );
  
    // Limpiar las ciudades cuando cambia el estado
    this.filteredCiudades2 = [];
    this.formPlanSalud.get('ciudad_titular')?.setValue('');
  
    // Si no hay coincidencias, marcar el campo como inválido
    if (this.filteredEstados2.length === 0 || 
        !this.filteredEstados2.some(estado => estado.xdescripcion_l.toLowerCase() === inputValue)) {
      this.formPlanSalud.get('estado_titular')?.setErrors({ invalid: true });
    } else {
      this.formPlanSalud.get('estado_titular')?.setErrors(null);
    }
  }
  
  
  public selectEstadoTI(estado: Estado): void {
    this.formPlanSalud.get('estado_titular')?.setValue(estado.cestado.toString());
    this.formPlanSalud.get('estado_titular')?.markAsTouched();
    this.filteredEstados2 = [];
    const inputElement = document.querySelector('input[formControlName="estado_titular"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = estado.xdescripcion_l;
    }
    this.filteredCiudades2 = this.ciudad.filter(ciudad => ciudad.cestado === estado.cestado);
  }
  
  public onCiudadTI(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
    const estadoSeleccionado = this.formPlanSalud.get('estado_titular')?.value;
    const estado = this.estados.find(e => e.cestado === Number(estadoSeleccionado));
  
    if (!estado) {
      this.filteredCiudades2 = [];
      return;
    }
  
    if (inputValue === '') {
      this.filteredCiudades2 = this.ciudad.filter(ciudad => ciudad.cestado === estado.cestado);
    } else {
      this.filteredCiudades2 = this.ciudad.filter(ciudad =>
        ciudad.xdescripcion_l.toLowerCase().includes(inputValue) &&
        ciudad.cestado === estado.cestado
      );
    }
  
    // Validar que la ciudad seleccionada esté en la lista
    if (this.filteredCiudades2.length === 0 || 
        !this.filteredCiudades2.some(ciudad => ciudad.xdescripcion_l.toLowerCase() === inputValue)) {
      this.formPlanSalud.get('ciudad_titular')?.setErrors({ invalid: true });
    } else {
      this.formPlanSalud.get('ciudad_titular')?.setErrors(null);
    }
  }
  
  
  public selectCiudadTI(ciudad: Ciudad): void {
    this.formPlanSalud.get('ciudad_titular')?.setValue(ciudad.cciudad);
    this.formPlanSalud.get('ciudad_titular')?.markAsTouched();
    this.filteredCiudades2 = [];
    const inputElement = document.querySelector('input[formControlName="ciudad_titular"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = ciudad.xdescripcion_l;
    }
  }
  
  public getCiudadDescripcionTI(): string {
    const ciudadNumero = this.formPlanSalud.get('ciudad_titular')?.value;
    const ciudad = this.ciudad.find(c => c.cciudad === ciudadNumero);
    return ciudad ? ciudad.xdescripcion_l : '';
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

  private generateForm() {
    this.formPlanSalud = this.fb.group({
      poliza: new FormControl(''),
      plan: new FormControl('APP2'),
      canal_venta: new FormControl(''),
      cedula_tomador: new FormControl('',Validators.required),
      rif_tomador: new FormControl('',Validators.required),
      nombre_tomador: new FormControl('',Validators.required),
      apellido_tomador: new FormControl('',Validators.required),
      sexo_tomador: new FormControl('',Validators.required),
      estado_civil_tomador: new FormControl('',Validators.required),
      fnac_tomador: new FormControl('',Validators.required),
      estado_tomador: new FormControl('',Validators.required),
      ciudad_tomador: new FormControl('',Validators.required),
      direccion_tomador: new FormControl('',Validators.required),
      telefono_tomador: new FormControl('',[
        Validators.required,
        Validators.pattern(/^(0414|0416|0424|0426|0412)-\d{7}$/)
      ]),
      correo_tomador: new FormControl('',[Validators.required,Validators.email]),
      cedula_titular: new FormControl('',Validators.required),
      rif_titular: new FormControl('',Validators.required),
      nombre_titular: new FormControl('',Validators.required),
      apellido_titular: new FormControl('',Validators.required),
      sexo_titular: new FormControl('',Validators.required),
      estado_civil_titular: new FormControl('',Validators.required),
      fnac_titular: new FormControl('',Validators.required),
      estado_titular: new FormControl('',Validators.required),
      ciudad_titular: new FormControl('',Validators.required),
      direccion_titular: new FormControl('',Validators.required),
      telefono_titular: new FormControl('',[
        Validators.required,
        Validators.pattern(/^(0414|0416|0424|0426|0412)-\d{7}$/)
      ]),
      dec_persona_politica: new FormControl(false),
      dec_term_y_cod: new FormControl(false),
      dec_diagnos_enferm: new FormControl(false),
      dec_descrip_enferm: new FormControl(''),
      correo_titular: new FormControl('',[Validators.required,Validators.email]),
      productor: new FormControl('0'),
      frecuencia: new FormControl('A'),
      fecha_emision :  new FormControl(this.getCurrentDate()),
      sameAsTomador: new FormControl(false),
      asegurados: new FormArray([]),
      beneficiarios: new FormArray([]),

    });

    this.tomadorSubscription.add(
      this.formPlanSalud.get('sameAsTomador')!.valueChanges.subscribe(value => {
        this.onCheckboxChange(value);
      })
    );

    this.tomadorSubscription.add(
      this.formPlanSalud.get('cedula_tomador')!.valueChanges.subscribe(value => {
        if (this.isTitularDisabled) {
          this.formPlanSalud.get('cedula_titular')!.setValue(value, { emitEvent: false });
        }
      })
    );

    this.tomadorSubscription.add(
      this.formPlanSalud.get('rif_tomador')!.valueChanges.subscribe(value => {
        if (this.isTitularDisabled) {
          this.formPlanSalud.get('rif_titular')!.setValue(value, { emitEvent: false });
        }
      })
    );

    this.tomadorSubscription.add(
      this.formPlanSalud.get('nombre_tomador')!.valueChanges.subscribe(value => {
        if (this.isTitularDisabled) {
          this.formPlanSalud.get('nombre_titular')!.setValue(value, { emitEvent: false });
        }
      })
    );

    this.tomadorSubscription.add(
      this.formPlanSalud.get('apellido_tomador')!.valueChanges.subscribe(value => {
        if (this.isTitularDisabled) {
          this.formPlanSalud.get('apellido_titular')!.setValue(value, { emitEvent: false });
        }
      })
    );

    this.tomadorSubscription.add(
      this.formPlanSalud.get('sexo_tomador')!.valueChanges.subscribe(value => {
        if (this.isTitularDisabled) {
          this.formPlanSalud.get('sexo_titular')!.setValue(value, { emitEvent: false });
        }
      })
    );

    this.tomadorSubscription.add(
      this.formPlanSalud.get('estado_civil_tomador')!.valueChanges.subscribe(value => {
        if (this.isTitularDisabled) {
          this.formPlanSalud.get('estado_civil_titular')!.setValue(value, { emitEvent: false });
        }
      })
    );

    this.tomadorSubscription.add(
      this.formPlanSalud.get('fnac_tomador')!.valueChanges.subscribe(value => {
        if (this.isTitularDisabled) {
          this.formPlanSalud.get('fnac_titular')!.setValue(value, { emitEvent: false });
        }
      })
    );

    this.tomadorSubscription.add(
      this.formPlanSalud.get('estado_tomador')!.valueChanges.subscribe(value => {
        if (this.isTitularDisabled) {
          const estado = this.estados.find(e => e.cestado.toString() === value);
          if (estado) {
            this.formPlanSalud.get('estado_titular')!.setValue(estado.cestado.toString(), { emitEvent: false });
    
            // Actualizar el valor del input con la descripción del estado
            const inputElement = document.querySelector('input[formControlName="estado_titular"]') as HTMLInputElement;
            if (inputElement) {
              inputElement.value = estado.xdescripcion_l;
            }
          }
        }
      })
    );
    

    this.tomadorSubscription.add(
      this.formPlanSalud.get('ciudad_tomador')!.valueChanges.subscribe(value => {
        if (this.isTitularDisabled) {
          this.formPlanSalud.get('ciudad_titular')!.setValue(value, { emitEvent: false });
        }
      })
    );

    this.tomadorSubscription.add(
      this.formPlanSalud.get('direccion_tomador')!.valueChanges.subscribe(value => {
        if (this.isTitularDisabled) {
          this.formPlanSalud.get('direccion_titular')!.setValue(value, { emitEvent: false });
        }
      })
    );

    this.tomadorSubscription.add(
      this.formPlanSalud.get('telefono_tomador')!.valueChanges.subscribe(value => {
        if (this.isTitularDisabled) {
          this.formPlanSalud.get('telefono_titular')!.setValue(value, { emitEvent: false });
        }
      })
    );

    this.tomadorSubscription.add(
      this.formPlanSalud.get('correo_tomador')!.valueChanges.subscribe(value => {
        if (this.isTitularDisabled) {
          this.formPlanSalud.get('correo_titular')!.setValue(value, { emitEvent: false });
        }
      })
    );

  }

  ngOnInit() {
    const planSeleccionado = JSON.parse(localStorage.getItem('Descripcion_products') || '[]');
    this.descripcion = planSeleccionado
    const emailInfo : any = JSON.parse(localStorage.getItem('auth-session') || '[]')
    const data : any = jwtDecode(emailInfo.infoUser)
    this.email = data.email
    this.informacionOcrStorage();
    this.getInfoData(); 
    this.getNumberPoliza()
    setTimeout(() => {
      this.updateNumberPoliza()
    }, 5000);   
  }

  private async getNumberPoliza() {
    try {
        const response: any = await (await this.mundialService.getNumber()).toPromise();
        this.numeroObtenido = response.currentNumber;
    } catch (error) {
        console.error('Error fetching number:', error);
    }
}

private async updateNumberPoliza() {
    try {
        const newNumber = this.numeroObtenido + 1;
        const datos = { newNumber };
        const response: any = await (await this.mundialService.updateNumber(datos)).toPromise();
        this.numeroObtenido = newNumber;
        this.formPlanSalud.get('poliza')?.setValue(this.numeroObtenido)
        localStorage.setItem('numero',JSON.stringify(this.numeroObtenido));
    } catch (error) {
        console.error('Error updating number:', error);
    }
}
private informacionOcrStorage() {
  const StoredCedula: string | null = localStorage.getItem('documento_identidad');
  const CEDULA = StoredCedula ? JSON.parse(StoredCedula) : {};
  const numeroCedulaSoloNumeros = CEDULA.numero_de_cedula ? CEDULA.numero_de_cedula.replace(/\D/g, '') : '';
  const nombreLimpio = CEDULA.nombre
    ? CEDULA.nombre
        .replace(/FIRMA\s*TITULAR/g, '')
        .replace(/FIRMATITULAR/g, '')      
        .trim()                           
    : '';

  this.formPlanSalud.patchValue({
    nombre_tomador: nombreLimpio,
    apellido_tomador: CEDULA.apellido ?? '',
    rif_tomador: numeroCedulaSoloNumeros ?? '',
  });
}

  public onCheckboxChange(event: any) {
    const isChecked = event.target.checked; 
    this.isTitularDisabled = isChecked;
    if (isChecked) {
      this.copyTomadorToTitular();
    } else {
      this.clearTitularFields();
    }
  }
  private copyTomadorToTitular() {
    const tomador = this.formPlanSalud.value;
    this.formPlanSalud.patchValue({
      cedula_titular: tomador.cedula_tomador,
      rif_titular: tomador.rif_tomador,
      nombre_titular: tomador.nombre_tomador,
      apellido_titular: tomador.apellido_tomador,
      sexo_titular: tomador.sexo_tomador,
      estado_civil_titular: tomador.estado_civil_tomador,
      fnac_titular: tomador.fnac_tomador,
      estado_titular: tomador.estado_tomador,
      ciudad_titular: tomador.ciudad_tomador,
      direccion_titular: tomador.direccion_tomador,
      telefono_titular: tomador.telefono_tomador,
      correo_titular: tomador.correo_tomador,
    });
  }

  private clearTitularFields() {
    this.formPlanSalud.patchValue({
      cedula_titular: '',
      rif_titular: '',
      nombre_titular: '',
      apellido_titular: '',
      sexo_titular: '',
      estado_civil_titular: '',
      fnac_titular: '',
      estado_titular: '',
      ciudad_titular: '',
      direccion_titular: '',
      telefono_titular: '',
      correo_titular: '',
    });
  }

  routingNavigate() {
    this.navController.navigateRoot('9d3a6e2b1f7c4d8e5b9a4c7f8a1d2c9');
  }

  ngOnDestroy() {
    this.tomadorSubscription.unsubscribe();
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

  public async Submit() {   
    this.showLoading = true;
    if (this.formPlanSalud.valid && this.formPlanSalud.get('dec_term_y_cod')?.value) {
        try {
              localStorage.setItem('Datos-poliza-mundial',JSON.stringify(this.formPlanSalud.value))
                setTimeout(() => {
                  this.toastMessage('Datos guardados perfectamente','checkmark-circle',2800, 'success');
                  this.navController.navigateRoot('1d4c5e7b3f9a8e2a6b0d9f3c7a1b4e8');
                }, 2000);
            }  finally {

        }
    } else {
      this.formPlanSalud.markAllAsTouched();
      this.toastMessage('Completa todos los campos','alert-circle',2800,'danger');
      this.showLoading = false;
    }
}

  public getInfoData() {
  return this.http.get<any>(`${environment.mailPoliza}/data`).subscribe((data:any) => {
    this.ciudad = data.data;
  })
}

}
