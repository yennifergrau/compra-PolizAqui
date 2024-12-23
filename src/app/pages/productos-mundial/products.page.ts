import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage {
  public title: string = 'Productos de Seguros';

  constructor(private navController: NavController) {
    this.requestCameraPermissions();
  }

  public navigateRouting(id: string, name: string) {
    localStorage.setItem('id-routing', JSON.stringify(id));
    if (id === '0') {
      this.navController.navigateRoot('7b6c4e9d1a2f5a8d3c9b4e7f8a3d1c2');
      localStorage.setItem('Descripcion_products', JSON.stringify(name));
      const plan = 'Auto';
      localStorage.setItem('plan', JSON.stringify(plan));
      localStorage.setItem('price', JSON.stringify('20'));
      localStorage.removeItem('Datos-poliza-mundial-rcv');
      localStorage.removeItem('Datos-poliza-mundial');
    } else if (id === '1' && name === 'Gastos Funerarios') {
      this.navController.navigateRoot('8a6d4e3b7c9f2a1e5b8d9c4a3f7e6d1a');
      localStorage.setItem('Descripcion_products', JSON.stringify(name));
      localStorage.setItem('price', JSON.stringify('9'));
      localStorage.removeItem('Datos-poliza-mundial-rcv');
      localStorage.removeItem('Datos-poliza-mundial');
    } else if (id === '2' && name === 'Producto 3en1') {
      this.navController.navigateRoot('c2a7e5f4d9b8c3d1a6b4d9e7f3a2c8b');
      localStorage.setItem('Descripcion_products', JSON.stringify(name));
      localStorage.setItem('price', JSON.stringify('12'));
      localStorage.removeItem('Datos-poliza-mundial-rcv');
      localStorage.removeItem('Datos-poliza-mundial');
    } else if (id === '3') {
      this.navController.navigateRoot('**');
    } else if (id === '4') {
      this.navController.navigateRoot('d5c9a4e7b3f1a2d8e6b4c9d7f8a3b1e');
      localStorage.setItem('Descripcion_products', JSON.stringify(name));
      const plan = 'APP3';
      localStorage.setItem('plan', JSON.stringify(plan));
      localStorage.setItem('price', JSON.stringify('10'));
      localStorage.removeItem('Datos-poliza-mundial-rcv');
      localStorage.removeItem('Datos-poliza-mundial');
    }
  }

  // Solicitar permisos de la cámara tanto en navegador como en app
  async requestCameraPermissions() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch (error) {
        return false;
      }
    } else if (window.Capacitor) {
      try {
        const result = await Camera.requestPermissions();
        if (result.camera === 'granted') {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error('Error al solicitar permisos de cámara:', error);
        return false;
      }
    } else {
      console.error('La API getUserMedia no está disponible en este navegador.');
      return false;
    }
  }
}
