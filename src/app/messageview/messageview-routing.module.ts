import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MessageviewPage } from './messageview.page';

const routes: Routes = [
  {
    path: '',
    component: MessageviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessageviewPageRoutingModule {}
