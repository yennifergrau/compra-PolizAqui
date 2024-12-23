import { Component, inject, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { jwtDecode } from 'jwt-decode';
import { InserDataService } from 'src/app/services/inser-data.service';

@Component({
  selector: 'app-retorno',
  templateUrl: './retorno.page.html',
  styleUrls: ['./retorno.page.scss'],
})
export class RetornoPage implements OnInit {

  private navCtrl = inject(NavController);
  private insertService = inject(InserDataService);
  public dataPoliza: any[] = [];
  private emailPoliza: any;
  public modalCompartir : boolean = false;
  public item: any [] = []

  constructor() {}

  ngOnInit() {
    const dataInfo = JSON.parse(localStorage.getItem('auth-session') || '[]');
    const informacion: any = jwtDecode(dataInfo.infoUser);
    this.emailPoliza = informacion.email;

    this.getPendPoliza();
  }

  private async getPendPoliza() {
    const response = await this.insertService.getPoliza();
    this.dataPoliza = response.data.filter((email: any) => email.email_usuario === this.emailPoliza);
    this.item = this.dataPoliza 
  }

  public exitNavigate() {
    this.navCtrl.navigateBack('e1f8a6b1e5c9b54a6d4f7c8d3a5a3e58');
  }

  openModalCompartir() {
    this.modalCompartir = true;
  }

  closeModal() {
    this.modalCompartir = false;
  }

  public getPaymentData(item: any) {
      this.item = item;
      this.openModalCompartir();
    }
  }
  

