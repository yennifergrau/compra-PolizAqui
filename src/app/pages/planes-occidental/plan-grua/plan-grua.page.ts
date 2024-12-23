import { Component  } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-plan-grua',
  templateUrl: './plan-grua.page.html',
  styleUrls: ['./plan-grua.page.scss'],
})
export class PlanGruaPage{

  constructor(
    private navController: NavController
  ) { }

  public routingNavigate(): void {
    this.navController.navigateRoot(['occidental-vista']);
    localStorage.removeItem('CURRENT_SCAN');
    localStorage.removeItem('CURRENT_ADJUNTO')
    localStorage.removeItem('OCR_LICENCIA');
    localStorage.removeItem('OCR_CARNET');
    localStorage.removeItem('OCR_CEDULA')
  }

}
