import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from './services/alert.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  private inactivityTimer: any;
  private readonly inactivityTime = 5 * 60 * 1000;
  public cedula_rif!: string;
  public nombre!: string;

  constructor(
    private alertService: AlertService,
    private router: Router,
    private platform: Platform,
    private activatedRoute: ActivatedRoute
  ) {
    this.resetInactivityTimer();
    this.initializeBackButtonCustomHandler();
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['cedula_rif'] && params['nombre']) {
        this.cedula_rif = params['cedula_rif'];
        this.nombre = params['nombre'];
        localStorage.setItem('empresa-aliada', JSON.stringify(this.nombre));
      } else {
        // Si no hay parámetros en la URL, recuperar del localStorage
        const storedNombre = localStorage.getItem('empresa-aliada');
        if (storedNombre) {
          this.nombre = JSON.parse(storedNombre);
        }
      }
    });
    

  }

  initializeBackButtonCustomHandler(): void {
    this.platform.backButton.subscribeWithPriority(9999, () => {
    });
  }

  @HostListener('window:mousemove')
  @HostListener('window:keydown')
  @HostListener('window:scroll')
  resetInactivityTimer() {
    clearTimeout(this.inactivityTimer);
    this.inactivityTimer = setTimeout(() => this.handleInactivity(), this.inactivityTime);
  }

  private handleInactivity() {
    this.alertService.showModal();
  }

  shouldShowToolbar(): boolean {
    const currentUrl = this.router.url.split('?')[0];
    const excludedRoutes = [
      '/b4d9ef72dc4a9b91e8a1d6b9d1a423a7',
      '/d9c67a47c4db8292cf4d24e2a9b8c9f2',
      '/72a639d5a9b4b4efb2c2b87a05fc84e5',
    ];
  
    // Verificar si coincide con rutas exactas
    if (excludedRoutes.includes(currentUrl)) {
      return false;
    }
  
    // Verificar rutas dinámicas
    if (currentUrl.startsWith('/8e5d9c7a4b1f2a3d6c4e9b3a7f8d1c2/')) {
      return false;
    }
  
    return true;
  }
  
  

}
