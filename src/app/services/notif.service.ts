import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { KeyringPair } from '@polkadot/keyring/types';
import { KeyringService } from './keyring.service';

@Injectable({
  providedIn: 'root',
})
export class NotifService {
  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
  ) {}

  async showNotif(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: 'top',
    });
    await toast.present();
  }

  async generalErrorAlert(msg: string) {
    const alert = await this.alertController.create({
      header: msg,
      buttons: [
        {
          text: 'OK',
        },
      ],
    });
    await alert.present();
  }
}
