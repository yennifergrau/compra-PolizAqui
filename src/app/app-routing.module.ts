import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { PolicyComponent } from './shared/models/politicas/policy.component';
import { RouteGuard } from './guards/page-not-found.guard';

const routes: Routes = [

  {
    path: 'b4d9ef72dc4a9b91e8a1d6b9d1a423a7',
    loadChildren: () => import('./pages/auth/login/login.module').then(m => m.LoginPageModule),
  },
  {
    path: 'd9c67a47c4db8292cf4d24e2a9b8c9f2',
    loadChildren: () => import('./pages/auth/password/password.module').then(m => m.PasswordPageModule)
  },
  {
    path: '72a639d5a9b4b4efb2c2b87a05fc84e5',
    loadChildren: () => import('./pages/auth/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: '7f7d9e3d1e7b5f6a9c8b4a9d4c9d2e4a',
    loadChildren: () => import('./pages/confirmacion-mundial/confirmacion.module').then(m => m.ConfirmacionPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: 'a9b54f87d1e4c2a7d9e8c6b3f7a4c9b1',
    loadChildren: () => import('./pages/ocr-mundial/data/data.module').then(m => m.DataPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: '5c8d3e7b9a2f4a1b6e4c9d7a5b8e3f9c',
    loadChildren: () => import('./pages/ocr-mundial/image/image.module').then(m => m.ImagePageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: '3d9f7c5a2b4e1d8c9a6b3e7d4a9c2f8e',
    loadChildren: () => import('./pages/ocr-mundial/uploads/uploads.module').then(m => m.UploadsPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: '8a6d4e3b7c9f2a1e5b8d9c4a3f7e6d1a',
    loadChildren: () => import('./pages/planes-mundial/plan-funerario/funerario-mundial.module').then(m => m.FunerarioMundialPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: 'c2a7e5f4d9b8c3d1a6b4d9e7f3a2c8b',
    loadChildren: () => import('./pages/planes-mundial/plan-salud/salud.module').then(m => m.SaludPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: '7b6c4e9d1a2f5a8d3c9b4e7f8a3d1c2',
    loadChildren: () => import('./pages/planes-mundial/plan-auto/rcv.module').then(m => m.RcvPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: 'd5c9a4e7b3f1a2d8e6b4c9d7f8a3b1e',
    loadChildren: () => import('./pages/planes-mundial/plan-moto/plan-moto.module').then( m => m.PlanMotoPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: 'e1f8a6b1e5c9b54a6d4f7c8d3a5a3e58',
    loadChildren: () => import('./pages/productos-mundial/products.module').then(m => m.ProductsPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: '4a1b8e5c9d3f7d2e6c9a4b1d8e3f7c9',
    loadChildren: () => import('./pages/formularios/plan-rcv/plan-rcv.module').then(m => m.PlanRcvPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: 'b9e4a6c3d1f8d2b7c9a5e4d7f3b8a1e',
    loadChildren: () => import('./pages/formularios/plan-funerario/plan-funerario.module').then(m => m.PlanFunerarioPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: '3c7e5b9d2f1a8d6a4c9b7e3d8f1a2c9',
    loadChildren: () => import('./pages/formularios/plan-moto/plan-moto.module').then( m => m.PlanMotoPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: '6a4d9b2f3c1e8d7b5c9e4a7f3d2a1b8',
    loadChildren: () => import('./pages/formularios/plan-salud/plan-salud.module').then(m => m.PlanSaludPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: '8e5d9c7a4b1f2a3d6c4e9b3a7f8d1c2/:email',
    loadChildren: () => import('./pages/auth/recuperacion/recuperacion.module').then( m => m.RecuperacionPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: '2d4b8e3c1a7f9d5e6c9a4d8f3b1a7e2',
    loadChildren: () => import('./pages/ocr-mundial/views/rcv/rcv.module').then( m => m.RcvPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: '9d3a6e2b1f7c4d8e5b9a4c7f8a1d2c9',
    loadChildren: () => import('./pages/ocr-mundial/views/normal/normal.module').then( m => m.NormalPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: '4b6d2a5f9e1c7a3c8b4e9d7f3a2b8e1',
    loadChildren: () => import('./pages/ocr-mundial/data/uploads/uploads.module').then( m => m.UploadsPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: '1d4c5e7b3f9a8e2a6b0d9f3c7a1b4e8',
    loadChildren: () => import('./pages/pagos/pago-mundial/pago-mundial.module').then( m => m.PagoMundialPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'products-occidental',
    loadChildren: () => import('./pages/productos-occidental/products-occidental.module').then( m => m.ProductsOccidentalPageModule),
  },
  {
    path: 'plan-rcv',
    loadChildren: () => import('./pages/planes-occidental/plan-auto/plan-rcv.module').then( m => m.PlanRcvPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: 'image-occiental',
    loadChildren: () => import('./pages/ocr-occidental/image/image.module').then( m => m.ImagePageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: 'uploads-occidental',
    loadChildren: () => import('./pages/ocr-occidental/uploads/uploads.module').then( m => m.UploadsPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: 'occidental-vista',
    loadChildren: () => import('./pages/ocr-mundial/views/occidental/occidental.module').then( m => m.OccidentalPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: 'plan-occidental-rcv',
    loadChildren: () => import('./pages/formularios/occidental/plan-occidental-rcv/plan-occidental-rcv.module').then( m => m.PlanOccidentalRcvPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: 'payment-occidental',
    loadChildren: () => import('./pages/pagos/pago-occidental/pago-occidental.module').then( m => m.PagoOccidentalPageModule),
    // canActivate:[RouteGuard]
  },

  {
    path: 'confirmacion-occidental',
    loadChildren: () => import('./pages/confirmacion-occidental/confirmacion-occidental.module').then( m => m.ConfirmacionOccidentalPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path:'term-policy-dev',
    component: PolicyComponent
  },
  {
    path: '9enps29dfsAfSf8JUgz3Wa3A6NqK0pUFCAf3c6fIYw3lM',
    loadChildren: () => import('./shared/models/retorno/retorno.module').then( m => m.RetornoPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: 'plan-grua',
    loadChildren: () => import('./pages/planes-occidental/plan-grua/plan-grua.module').then( m => m.PlanGruaPageModule),
    // canActivate:[RouteGuard]
  },
  {
    path: '',
    redirectTo: 'b4d9ef72dc4a9b91e8a1d6b9d1a423a7',
    pathMatch: 'full'
  },
  {
    path: '**',
    component: NotFoundComponent
  },







];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
