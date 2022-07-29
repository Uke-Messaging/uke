import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MessageviewPageRoutingModule } from './messageview-routing.module';

import { MessageviewPage } from './messageview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MessageviewPageRoutingModule
  ],
  declarations: [MessageviewPage]
})
export class MessageviewPageModule {}
