import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';
import { PasswordService } from 'src/app/services/password.service';

@Component({
  selector: 'app-password',
  templateUrl: './password.page.html',
  styleUrls: ['./password.page.scss'],
})
export class PasswordPage{

  public title:string='Recuperar Contraseña';
  public formForgot!:FormGroup;
  private fb = inject( FormBuilder );
  public ShowLoading : boolean = false;

  constructor(
    private notificacionService: NotificationService,
    private passwordService: PasswordService,
    private toastController: ToastController
  ) {
    this.generateForm();
   }

  private generateForm() {
    this.formForgot = this.fb.group({
      email:['',[Validators.required,Validators.email]]
    })
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
    this.ShowLoading = true;
    if(this.formForgot.valid){
       this.passwordService.forgotPassword(this.formForgot.value).pipe(
        catchError((err: HttpErrorResponse) => {
          if(err.status === 404 && err.error){
            this.ShowLoading = false;
            this.toastMessage('No se encontro el usuario','alert-circle',2800,'danger')
          } else {
            this.toastMessage('Ocurrio un Error intentelo de nuevo','alert-circle',2800,'danger')
          }
          return throwError(err)
        })
      ).subscribe(response => {
        this.ShowLoading = false;
        if(response.code === 200) {
          this.toastMessage('Hemos enviado un correo con las instrucciones para restablecer tu contraseña','checkmark-circle',2800,'success');
          this.requestNotification();
        }
      })
    }
  }

  private async requestNotification() {
    const notificationData = {
      title: 'PolizAqui te informa 📢',
      message: '¡Gracias por confiar en nosotros! Hemos enviado un correo con las instrucciones para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada para continuar con el proceso. ¡Te deseamos una excelente experiencia!'
    }
    return await this.notificacionService.sendNotification(notificationData);
  }
}
