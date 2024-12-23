import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-funerario-mundial',
  templateUrl: './funerario-mundial.page.html',
  styleUrls: ['./funerario-mundial.page.scss'],
})
export class FunerarioMundialPage implements OnInit {

  constructor(
    private navController: NavController
  ) { }

  public routingNavigate(): void {
    this.navController.navigateRoot(['9d3a6e2b1f7c4d8e5b9a4c7f8a1d2c9']);
    localStorage.removeItem('CURRENT_DOCUMENTO_SCAN');
    localStorage.removeItem('CURRENT_DOCUMENTO_ADJUNTO');
    localStorage.removeItem('documento_identidad')
  }

  private coberturas = {
    name: 'Gastos Funerarios',
    costo_anual: '9'
  };

  ngOnInit() {
    localStorage.setItem('infoPlan', JSON.stringify(this.coberturas));
  }

}
