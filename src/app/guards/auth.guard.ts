import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { NavController } from '@ionic/angular';
import { KeyringService } from '../services/keyring.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private keyring: KeyringService, private nav: NavController) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return await this.checkCurrentAccount();
  }

  private async checkCurrentAccount() {
    if (await this.keyring.getAuthenticationStatus()) {
      return true;
    }
    this.nav.navigateRoot('/signup');
  }
}
