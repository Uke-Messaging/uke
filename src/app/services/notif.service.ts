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
    private keyring: KeyringService
  ) {}

  async showNotif(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: 'top',
    });
    await toast.present();
  }

  async askForPasswordAlert(keypair: KeyringPair) {
    const alert = await this.alertController.create({
      header: 'Please reauthenticate your account',
      buttons: [
        {
          text: 'Done',
          handler: (password) => this.keyring.auth(password['0'], keypair),
        },
      ],
      inputs: [
        {
          placeholder: 'Name',
          type: 'password',
        },
      ],
    });

    await alert.present();
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
