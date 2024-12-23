import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-products-occidental',
  templateUrl: './products-occidental.page.html',
  styleUrls: ['./products-occidental.page.scss'],
})
export class ProductsOccidentalPage {

  public title:string = 'Productos de Seguros';
  private planAuto = 'RCV auto';
  private numeroPLanAuto : string = '034';
  private precioPlanAuto : string = '33';
  private planGrua : string = 'Servicio de Grúa';
  private precioPlanGrua : string = '120';
  private numeroPlanGrua : string = '035'

  constructor(
    private navController: NavController
  ) { this.requestCameraPermissions() }

  public navigateRouting(id:string,name:string) {
    localStorage.setItem('id-routing',JSON.stringify(id))
    if(id === '0'){
      localStorage.setItem('Descripcion_occidental',JSON.stringify(name))
      localStorage.setItem('nPlan',JSON.stringify(this.numeroPLanAuto))
      localStorage.setItem('plan',JSON.stringify(this.planAuto))
      localStorage.setItem('price',JSON.stringify(this.precioPlanAuto))
      this.navController.navigateRoot('plan-rcv')
    }else if(id === '1'){
      localStorage.setItem('Descripcion_occidental',JSON.stringify(name))
      localStorage.setItem('nPlan',JSON.stringify(this.numeroPlanGrua))
      localStorage.setItem('plan',JSON.stringify(this.planGrua))
      localStorage.setItem('price',JSON.stringify(this.precioPlanGrua))
      this.navController.navigateRoot('plan-grua')
  }else if(id === '3'){
      this.navController.navigateRoot('**')
    }
  }

  private async  requestCameraPermissions() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });     
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }}
}
