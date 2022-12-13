import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeyringService } from '../services/keyring.service';
import { NotifService } from '../services/notif.service';
import { UkePalletService } from '../services/ukepallet.service';
import { StoredUser, User } from '../model/user.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  loginSwitch: boolean = false;

  userId: string = '';
  password: string = '';
  verifyPassword: string = '';
  switchText: string = 'already have an account?';

  constructor(
    private keyring: KeyringService,
    private router: Router,
    private uke: UkePalletService,
    private notifService: NotifService
  ) {}

  ngOnInit() {}

  switchLogin() {
    this.loginSwitch = !this.loginSwitch;
    if (this.loginSwitch) this.switchText = 'need to create an account?';
    else this.switchText = 'already have an account?';
  }

  async login() {
    try {
      const keypair = await this.keyring.loadAccount();
      if (this.userId != keypair.username)
        throw Error("User id doesn't match stored keypair");
      await this.keyring.auth(this.password, keypair.keypair);
      await this.router.navigate(['/tabs/tab1']);
    } catch (e) {
      console.log(e);
      this.notifService.generalErrorAlert(
        `Wrong credentials (username or password), or user doesn't exist.`
      );
    }
  }

  async signup() {
    if (this.password !== this.verifyPassword || this.password.length < 3) {
      throw Error('Passwords do not match or it is not at least 3 chars');
    } else {
      await this.keyring
        .createNewAccount(this.userId, this.password, this.verifyPassword)
        .then(async (_) => {
          const local = await this.keyring.loadAccount();
          local.keypair.unlock(this.password);
          await this.uke.assignUsername(this.userId, local.keypair);
          local.keypair.lock();
          await this.keyring.auth(this.password, local.keypair);
          await this.router.navigate(['/tabs/tab1']);
        })
        .catch((_) => {
          if (_.message === 'User ID already exists')
            this.keyring.clearStorage();
          this.notifService.generalErrorAlert(_.message);
        });
    }
  }

  async clear() {
    await this.keyring.clearStorage();
  }
}
