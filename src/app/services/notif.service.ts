import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class NotifService {
  constructor(
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  /** Show's an in app notification with the provided message.
   * @param {string} msg - Message to display.
   */
  async showNotif(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: 'top',
    });
    await toast.present();
  }

  /** Shows an alert containing the error specified.
   * @param {string} msg - Error message to display.
   */
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
