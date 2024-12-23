import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AfterViewChecked, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { jwtDecode } from 'jwt-decode';
import { Subscription } from 'rxjs';
import { Ciudad, Estado, estados } from 'src/app/interface/formulario.3en1';
import { Marcas, Modelo, Qano, qanos, Version } from 'src/app/interface/formulario.rcv';
import { PolizaService } from 'src/app/services/poliza.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-plan-rcv',
  templateUrl: './plan-rcv.page.html',
  styleUrls: ['./plan-rcv.page.scss'],
})
export class PlanRcvPage implements OnInit, AfterViewChecked {

    public formPlanRCV!:FormGroup;
    public showLoading = false;
    public isTitularDisabled : boolean = false;
    private currentPolizaNumber!: number; 
    private tomadorSubscription: Subscription = new Subscription();
    public estados: Estado[] = estados;
    public ciudad : Ciudad [] = [];
    public filteredCiudades: Ciudad[] =[]
    public filteredCiudades2: Ciudad[] =[];
    public filteredEstados: Estado[] = [];
    public filteredEstados2: Estado[] = [];
    public filteredAno: Qano[] = [];
    private http = inject( HttpClient );
    public qano : Qano [] = qanos;
    private descripcion:string = ''
    public marcas : Marcas[] = [];
    public filteredMarca : Marcas[] = [];
    private añoSeleccionado : any
    private marcaSeleccionada : any;
    public modelo : Modelo[] =[];
    public filteredModelo : Modelo[] = [];
    private modeloSeleccionado: any;
    public version : Version [] = [];
    public filteredVersion : Version[] = [];
    private varsionSeleccionada : any
    private numeroObtenido : any;
    private email : any
    public verificarCorreoControl: FormControl = new FormControl('');
    public correoNoCoincide: boolean = false;
    public correoCoincide: boolean = false

    constructor(
      private fb: FormBuilder,
      private changedRefDef: ChangeDetectorRef,
      private navController: NavController,
      private mundialService: PolizaService,
      private toastController: ToastController

    ) {
      this.generateForm()
      this.formPlanRCV.get('dec_term_y_cod')?.valueChanges.subscribe((value: boolean) => {
        this.formPlanRCV.get('dec_term_y_cod')?.setValue(value ? 1 : 0, { emitEvent: false });
      });
      this.formPlanRCV.get('dec_persona_politica')?.valueChanges.subscribe((value: boolean) => {
        this.formPlanRCV.get('dec_persona_politica')?.setValue(value ? 1 : 0, { emitEvent: false });
      });
    }

    public toggleCheckboxes(selectedId: string, otherId: string) {
      const selectedCheckbox = document.getElementById(selectedId) as HTMLInputElement;
      const otherCheckbox = document.getElementById(otherId) as HTMLInputElement;
      if (selectedCheckbox.checked) {otherCheckbox.checked = false}
    }

    public verificarCoincidencia(event: Event) {
      const inputElement = event.target as HTMLInputElement;
      const correoVerificado = inputElement.value;
      const correoTomador = this.formPlanRCV.get('correo_tomador')?.value;
      this.correoNoCoincide = correoTomador !== correoVerificado;
      this.correoCoincide = correoTomador === correoVerificado;
    }

    ngAfterViewChecked() {
      this.changedRefDef.detectChanges();
    }

  public DescripcionT(): string {
    const estadoNumero = this.formPlanRCV.get('estado_tomador')?.value;
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
    this.formPlanRCV.get('ciudad_tomador')?.setValue('');
  
    // Si no hay coincidencias, marcar el campo como inválido
    if (this.filteredEstados.length === 0 || 
        !this.filteredEstados.some(estado => estado.xdescripcion_l.toLowerCase() === inputValue)) {
      this.formPlanRCV.get('estado_tomador')?.setErrors({ invalid: true });
    } else {
      this.formPlanRCV.get('estado_tomador')?.setErrors(null);
    }
  }
  

  
  public selectEstadoT(estado: Estado): void {
    this.formPlanRCV.get('estado_tomador')?.setValue(estado.cestado.toString());
    this.formPlanRCV.get('estado_tomador')?.markAsTouched();
    this.filteredEstados = [];
    const inputElement = document.querySelector('input[formControlName="estado_tomador"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = estado.xdescripcion_l;
    }   
    this.filteredCiudades = this.ciudad.filter(ciudad => ciudad.cestado === estado.cestado);
  }

 public onCiudadT(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
    const estadoSeleccionado = this.formPlanRCV.get('estado_tomador')?.value;
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
      this.formPlanRCV.get('ciudad_tomador')?.setErrors({ invalid: true });
    } else {
      this.formPlanRCV.get('ciudad_tomador')?.setErrors(null);
    }
  }
  public selectCiudadT(ciudad: Ciudad): void {
    this.formPlanRCV.get('ciudad_tomador')?.setValue(ciudad.cciudad);
    this.formPlanRCV.get('ciudad_tomador')?.markAsTouched();
    this.filteredCiudades = [];
    const inputElement = document.querySelector('input[formControlName="ciudad_tomador"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = ciudad.xdescripcion_l;
    }
  }
  
  public getCiudadDescripcion(): string {
    const ciudadNumero = this.formPlanRCV.get('ciudad_tomador')?.value;
    const ciudad = this.ciudad.find(c => c.cciudad === ciudadNumero);
    return ciudad ? ciudad.xdescripcion_l : '';
  }

  public DescripcionTI(): string {
    const estadoNumero = this.formPlanRCV.get('estado_titular')?.value;
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
    this.formPlanRCV.get('ciudad_titular')?.setValue('');
  
    // Si no hay coincidencias, marcar el campo como inválido
    if (this.filteredEstados2.length === 0 || 
        !this.filteredEstados2.some(estado => estado.xdescripcion_l.toLowerCase() === inputValue)) {
      this.formPlanRCV.get('estado_titular')?.setErrors({ invalid: true });
    } else {
      this.formPlanRCV.get('estado_titular')?.setErrors(null);
    }
  }
  
  public selectEstadoTI(estado: Estado): void {
    this.formPlanRCV.get('estado_titular')?.setValue(estado.cestado.toString());
    this.formPlanRCV.get('estado_titular')?.markAsTouched();
    this.filteredEstados2 = [];
    const inputElement = document.querySelector('input[formControlName="estado_titular"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = estado.xdescripcion_l;
    }
    this.filteredCiudades2 = this.ciudad.filter(ciudad => ciudad.cestado === estado.cestado);
  }
  
  public onCiudadTI(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
    const estadoSeleccionado = this.formPlanRCV.get('estado_titular')?.value;
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
      this.formPlanRCV.get('ciudad_titular')?.setErrors({ invalid: true });
    } else {
      this.formPlanRCV.get('ciudad_titular')?.setErrors(null);
    }
  }
  
  
  public selectCiudadTI(ciudad: Ciudad): void {
    this.formPlanRCV.get('ciudad_titular')?.setValue(ciudad.cciudad);
    this.formPlanRCV.get('ciudad_titular')?.markAsTouched();
    this.filteredCiudades2 = [];
    const inputElement = document.querySelector('input[formControlName="ciudad_titular"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = ciudad.xdescripcion_l;
    }
  }
  
  public getCiudadDescripcionTI(): string {
    const ciudadNumero = this.formPlanRCV.get('ciudad_titular')?.value;
    const ciudad = this.ciudad.find(c => c.cciudad === ciudadNumero);
    return ciudad ? ciudad.xdescripcion_l : '';
  }
  

    private getCurrentDate(): string {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0')
      const hours = String(today.getHours()).padStart(2, '0');
      const minutes = String(today.getMinutes()).padStart(2, '0');
      const seconds = String(today.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    public getInfoData() {
      return this.http.get<any>(`${environment.mailPoliza}/data`).subscribe((data:any) => {
        this.ciudad = data.data;
      })
      }

    private generateForm() {
      this.formPlanRCV = this.fb.group({
        poliza: new FormControl(''),
        plan: new FormControl('APP4'),
        canal_venta: new FormControl(''),
        cedula_tomador: new FormControl('', Validators.required),
        rif_tomador: new FormControl('', Validators.required),
        nombre_tomador: new FormControl('', Validators.required),
        apellido_tomador: new FormControl('', Validators.required),
        sexo_tomador: new FormControl('', Validators.required),
        estado_civil_tomador: new FormControl('', Validators.required),
        fnac_tomador: new FormControl('', Validators.required),
        estado_tomador: new FormControl('', Validators.required),
        ciudad_tomador: new FormControl('', Validators.required),
        direccion_tomador: new FormControl('', Validators.required),
        telefono_tomador: new FormControl('', [
          Validators.required,
          Validators.pattern(/^(0414|0416|0424|0426|0412)-\d{7}$/)
        ]),
        correo_tomador: new FormControl('', [Validators.required,Validators.email]),
        cedula_titular: new FormControl('', Validators.required),
        rif_titular: new FormControl('', Validators.required),
        nombre_titular: new FormControl('', Validators.required),
        apellido_titular: new FormControl('', Validators.required),
        sexo_titular: new FormControl('',Validators.required),
        estado_civil_titular: new FormControl('', Validators.required),
        fnac_titular: new FormControl('', Validators.required),
        estado_titular: new FormControl('', Validators.required),
        ciudad_titular: new FormControl('', Validators.required),
        direccion_titular: new FormControl('', Validators.required),
        telefono_titular: new FormControl('', [
          Validators.required,
          Validators.pattern(/^(0414|0416|0424|0426|0412)-\d{7}$/)
        ]),
        dec_persona_politica: new FormControl(false),
        dec_term_y_cod: new FormControl(false),
        correo_titular: new FormControl('', [Validators.required,Validators.email]),
        marca: new FormControl('',Validators.required),
        modelo: new FormControl('',Validators.required),
        version: new FormControl('',Validators.required),
        año: new FormControl('',Validators.required),
        color: new FormControl('',Validators.required),
        placa: new FormControl('',Validators.required),
        serial_carroceria: new FormControl('',Validators.required),
        serial_motor: new FormControl('',Validators.required),
        productor: new FormControl('0'),
        frecuencia: new FormControl('A'),
        fecha_emision: new FormControl(this.getCurrentDate()),
        sameAsTomador: new FormControl(false),
      });
      this.tomadorSubscription.add(
        this.formPlanRCV.get('sameAsTomador')!.valueChanges.subscribe(value => {
          this.onCheckboxChange(value);
        })
      );
  
      this.tomadorSubscription.add(
        this.formPlanRCV.get('cedula_tomador')!.valueChanges.subscribe(value => {
          if (this.isTitularDisabled) {
            this.formPlanRCV.get('cedula_titular')!.setValue(value, { emitEvent: false });
          }
        })
      );
  
      this.tomadorSubscription.add(
        this.formPlanRCV.get('rif_tomador')!.valueChanges.subscribe(value => {
          if (this.isTitularDisabled) {
            this.formPlanRCV.get('rif_titular')!.setValue(value, { emitEvent: false });
          }
        })
      );
  
      this.tomadorSubscription.add(
        this.formPlanRCV.get('nombre_tomador')!.valueChanges.subscribe(value => {
          if (this.isTitularDisabled) {
            this.formPlanRCV.get('nombre_titular')!.setValue(value, { emitEvent: false });
          }
        })
      );
  
      this.tomadorSubscription.add(
        this.formPlanRCV.get('apellido_tomador')!.valueChanges.subscribe(value => {
          if (this.isTitularDisabled) {
            this.formPlanRCV.get('apellido_titular')!.setValue(value, { emitEvent: false });
          }
        })
      );
  
      this.tomadorSubscription.add(
        this.formPlanRCV.get('sexo_tomador')!.valueChanges.subscribe(value => {
          if (this.isTitularDisabled) {
            this.formPlanRCV.get('sexo_titular')!.setValue(value, { emitEvent: false });
          }
        })
      );
  
      this.tomadorSubscription.add(
        this.formPlanRCV.get('estado_civil_tomador')!.valueChanges.subscribe(value => {
          if (this.isTitularDisabled) {
            this.formPlanRCV.get('estado_civil_titular')!.setValue(value, { emitEvent: false });
          }
        })
      );
  
      this.tomadorSubscription.add(
        this.formPlanRCV.get('fnac_tomador')!.valueChanges.subscribe(value => {
          if (this.isTitularDisabled) {
            this.formPlanRCV.get('fnac_titular')!.setValue(value, { emitEvent: false });
          }
        })
      );
  
      this.tomadorSubscription.add(
        this.formPlanRCV.get('estado_tomador')!.valueChanges.subscribe(value => {
          if (this.isTitularDisabled) {
            const estado = this.estados.find(e => e.cestado.toString() === value);
            if (estado) {
              this.formPlanRCV.get('estado_titular')!.setValue(estado.cestado.toString(), { emitEvent: false });  
              const inputElement = document.querySelector('input[formControlName="estado_titular"]') as HTMLInputElement;
              if (inputElement) {
                inputElement.value = estado.xdescripcion_l;
              }
            }
          }
        })
      );
      
  
      this.tomadorSubscription.add(
        this.formPlanRCV.get('ciudad_tomador')!.valueChanges.subscribe(value => {
          if (this.isTitularDisabled) {
            this.formPlanRCV.get('ciudad_titular')!.setValue(value, { emitEvent: false });
          }
        })
      );
  
      this.tomadorSubscription.add(
        this.formPlanRCV.get('direccion_tomador')!.valueChanges.subscribe(value => {
          if (this.isTitularDisabled) {
            this.formPlanRCV.get('direccion_titular')!.setValue(value, { emitEvent: false });
          }
        })
      );
  
      this.tomadorSubscription.add(
        this.formPlanRCV.get('telefono_tomador')!.valueChanges.subscribe(value => {
          if (this.isTitularDisabled) {
            this.formPlanRCV.get('telefono_titular')!.setValue(value, { emitEvent: false });
          }
        })
      );
  
      this.tomadorSubscription.add(
        this.formPlanRCV.get('correo_tomador')!.valueChanges.subscribe(value => {
          if (this.isTitularDisabled) {
            this.formPlanRCV.get('correo_titular')!.setValue(value, { emitEvent: false });
          }
        })
      );
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

    public Ano(event: Event): void {
      const inputValue = (event.target as HTMLInputElement).value;
      const yearNumber = parseInt(inputValue, 10);
      if (!isNaN(yearNumber)) {
        this.filteredAno = this.qano.filter(año => año.qano.toString().includes(yearNumber.toString()));
      } else {
        this.filteredAno = [];
      }
    
      if (this.filteredAno.length === 0 || !this.filteredAno.some(año => año.qano.toString() === inputValue)) {
        this.formPlanRCV.get('año')?.setErrors({ invalid: true });
      } else {
        this.formPlanRCV.get('año')?.setErrors(null);
      }
    }

 public getAnoDescription(): string {
  const añoNumero = this.formPlanRCV.get('año')?.value;
  const año = this.qano.find(e => e.qano === añoNumero);
  return año ? año.qano.toString() : '';
}

 public async SelectAno(año: Qano): Promise<void> {
  this.formPlanRCV.get('año')?.setValue(año.qano); 
  this.formPlanRCV.get('año')?.markAsTouched();
  this.filteredAno = [];
  const data = { qano: año.qano.toString() };
  this.añoSeleccionado = año.qano;
  try {
    const response = await (await this.mundialService.marcaMundial(data)).toPromise();
    if (response && response.data && Array.isArray(response.data.brand)) { 
      this.marcas = response.data.brand; 
    } else {
      this.marcas = []; 
    }
  } catch (error) {
    console.error("Error al obtener las marcas:", error);
  }
}

public Marca(event: Event): void {
  const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
  this.filteredMarca = this.marcas.filter(marca => marca.xmarca.toLowerCase().includes(inputValue));
  
  if (this.filteredMarca.length === 0 || !this.filteredMarca.some(marca => marca.xmarca.toLowerCase() === inputValue)) {
    this.formPlanRCV.get('marca')?.setErrors({ invalid: true });
  } else {
    this.formPlanRCV.get('marca')?.setErrors(null);
  }
}

 public getDescripcionMarca(): string {
  const marcaNumero = this.formPlanRCV.get('marca')?.value;
  const marca = this.marcas.find(e => e.cmarca.toString() === marcaNumero);
  return marca ? marca.xmarca : '';
}

 public async selectMarca(marca: Marcas): Promise<void> {
  this.formPlanRCV.get('marca')?.setValue(marca.cmarca.toString());
  this.formPlanRCV.get('marca')?.markAsTouched();
  this.filteredMarca = [];
  const data = { qano: this.añoSeleccionado, cmarca: marca.cmarca };
  this.marcaSeleccionada = marca.cmarca
  try {
    const response = await (await this.mundialService.modeloMundial(data)).toPromise();
    if(response && response.data && Array.isArray(response.data.model)){
      this.modelo = response.data.model; 
    }else{
      this.modelo = []; 
    }
  } catch (err) {
    console.error("Error al obtener los modelos:", err); 
  }
}
public Modelo(event: Event): void {
  const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
  this.filteredModelo = this.modelo.filter(modelo => modelo.xmodelo.toLowerCase().includes(inputValue));
  
  if (this.filteredModelo.length === 0 || !this.filteredModelo.some(modelo => modelo.xmodelo.toLowerCase() === inputValue)) {
    this.formPlanRCV.get('modelo')?.setErrors({ invalid: true });
  } else {
    this.formPlanRCV.get('modelo')?.setErrors(null);
  }
}
      
    public getDescripcionModelo(): string {
        const modeloNumero = this.formPlanRCV.get('modelo')?.value;
        const modelo = this.modelo.find(e => e.cmodelo.toString() === modeloNumero); 
        return modelo ? modelo.xmodelo : ''; 
      }
      
    public async selectModelo(modelo: Modelo): Promise<void> {
        this.formPlanRCV.get('modelo')?.setValue(modelo.cmodelo.toString());
        this.formPlanRCV.get('modelo')?.markAsTouched();
        this.filteredModelo = []; 
        const data = { qano: this.añoSeleccionado, cmarca: this.marcaSeleccionada, cmodelo: modelo.cmodelo };
        this.modeloSeleccionado = modelo.cmodelo;
        try {
          const response = await (await this.mundialService.versionMundial(data)).toPromise();
          if (response && response.data && Array.isArray(response.data.version)) {
            this.version = response.data.version;
          } else {
            this.version = []; 
          }
        } catch (err) {
          console.error("Error al obtener los modelos:", err); 
        }
      }
      
      public Version(event: Event): void {
        const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
        this.filteredVersion = this.version.filter(version => version.xversion.toLowerCase().includes(inputValue));
      
        if (this.filteredVersion.length === 0 || !this.filteredVersion.some(version => version.xversion.toLowerCase() === inputValue)) {
          this.formPlanRCV.get('version')?.setErrors({ invalid: true });
        } else {
          this.formPlanRCV.get('version')?.setErrors(null);
        }
      }

    public getDescripcionVersion(): string {
        const versionNumero = this.formPlanRCV.get('version')?.value;
        const version = this.version.find(e => e.cversion.toString() === versionNumero);
        return version ? version.xversion : '';
      }

      async selectVersion(version:Version): Promise<void> {
        this.formPlanRCV.get('version')?.setValue(version.cversion.toString());
        this.formPlanRCV.get('version')?.markAsTouched();
        this.filteredVersion = [];
      }


    private copyTomadorToTitular() {
      const tomador = this.formPlanRCV.value;
      this.formPlanRCV.patchValue({
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
      this.formPlanRCV.patchValue({
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
    
    ngOnInit() {
      const planSeleccionado = JSON.parse(localStorage.getItem('Descripcion_products') || '[]')
      this.descripcion = planSeleccionado
      const emailUsuario : any = JSON.parse(localStorage.getItem('auth-session') || '[]')
      const emailDecodificado : any = jwtDecode(emailUsuario.infoUser)
      this.email = emailDecodificado.email
      this.informacionOcrStorage();
      this.getInfoData();
      this.changedRefDef.detectChanges();
      const info : any = localStorage.getItem('plan')
      const data = JSON.parse(info)
      this.formPlanRCV.get('plan')?.setValue(data)
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
          this.formPlanRCV.get('poliza')?.setValue(this.numeroObtenido)
          localStorage.setItem('numero',JSON.stringify(this.numeroObtenido));   
      } catch (error) {
          console.error('Error updating number:', error);
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

    private informacionOcrStorage() {
      const StoredLicense: string | null = localStorage.getItem('OCR_LICENCIA');
      const StoredCarnet: string | null = localStorage.getItem('OCR_CARNET');
      const StoredCedula: string | null = localStorage.getItem('OCR_CEDULA');
      const LICENSE = StoredLicense ? JSON.parse(StoredLicense) : {};
      const CARNET = StoredCarnet ? JSON.parse(StoredCarnet) : {};
      const CEDULA = StoredCedula ? JSON.parse(StoredCedula) : {};
      const numeroCedulaSoloNumeros = CEDULA.numero_de_cedula ? CEDULA.numero_de_cedula.replace(/\D/g, '') : '';
      const numeroLicenseSoloNumeros = LICENSE.numero_de_cedula ? LICENSE.numero_de_cedula.replace(/\D/g, '') : '';
      const numerocEDULASoloNumeros = CARNET.numero_de_cedula ? CARNET.numero_de_cedula.replace(/\D/g, '') : '';
      const nombreLimpio = (CEDULA.nombre ?? LICENSE.nombre ?? '')
        .replace(/FIRMA\s*TITULAR/g, '')
        .replace(/FIRMATITULAR/g, '')
        .trim();
      const apellidoLimpio = (CEDULA.apellido ?? LICENSE.apellido ?? '')
        .replace(/FIRMA\s*TITULAR/g, '')
        .replace(/FIRMATITULAR/g, '')
        .trim();
      this.formPlanRCV.patchValue({
        nombre_tomador: nombreLimpio,
        apellido_tomador: apellidoLimpio,
        rif_tomador: numeroCedulaSoloNumeros ?? numeroLicenseSoloNumeros ?? numerocEDULASoloNumeros ?? '',
        color: CARNET.color ?? '',
        placa: CARNET.placa ?? '',
        serial_motor: CARNET.serial_de_motor ?? '',
        serial_carroceria: CARNET.numero_carroceria ?? '',
      });
    }
    ngOnDestroy() {
      this.tomadorSubscription.unsubscribe();
    }
        
  /***** Submit *****/
  public async Submit() {   
    this.showLoading = true;
    if (this.formPlanRCV.valid && this.formPlanRCV.get('dec_term_y_cod')?.value) {
        try {
              localStorage.setItem('Datos-poliza-mundial-rcv',JSON.stringify(this.formPlanRCV.value))
                setTimeout(() => {
                  this.toastMessage('Datos guardados perfectamente','checkmark-circle',2800, 'success');
                  this.navController.navigateRoot('1d4c5e7b3f9a8e2a6b0d9f3c7a1b4e8');
                }, 2000);
            }  finally {
           
        }
    } else {
      this.formPlanRCV.markAllAsTouched();
      this.toastMessage('Completa todos los campos','alert-circle',2800,'danger');
      this.showLoading = false;
    }
}

   private sumarUnAno(): Date {
    const fechaActual = new Date();
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setFullYear(fechaActual.getFullYear() + 1);
    return nuevaFecha;
  }

  private async emailSend(data: any) {
    localStorage.setItem('Correo_Poliza',JSON.stringify(data))
  }
  public routingNavigate() {
   return this.navController.navigateRoot(['2d4b8e3c1a7f9d5e6c9a4d8f3b1a7e2'])
  }

}
