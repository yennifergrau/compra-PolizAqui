import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UploadsPageRoutingModule } from './uploads-routing.module';

import { UploadsPage } from './uploads.page';
import { DefaultSharedModule } from 'src/app/shared/module/default-shared.module';
import { HttpClientModule } from '@angular/common/http';
import { OcrService } from 'src/app/services/ocr.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UploadsPageRoutingModule,
    DefaultSharedModule,
    HttpClientModule
  ],
  providers:[OcrService],
  declarations: [UploadsPage]
})
export class UploadsPageModule {}
