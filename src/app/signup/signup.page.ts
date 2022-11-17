import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeyringService } from '../services/keyring.service';
import { NotifService } from '../services/notif.service';
import { UkePalletService } from '../services/ukepallet.service';

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

  ngOnInit() {
    this.uke.init();
  }

  switchLogin() {
    this.loginSwitch = !this.loginSwitch;
    if (this.loginSwitch) this.switchText = 'need to create an account?';
    else this.switchText = 'already have an account?';
  }

  async login() {
    try {
      const keypair = await this.keyring.loadAccount();
      console.log(keypair);
      if (keypair.username !== this.userId)
        throw Error("Username doesn't match account in storage");
      await this.keyring.auth(this.password, keypair.keypair);
      await this.router.navigate(['/tabs/tab1']);
    } catch (e) {
      console.log(e);
      throw Error('UNABLE TO AUTHENTICATE USER, BAD PASSWORD OR NOT CREATED.');
    }
  }

  async signup() {
    if (this.password !== this.verifyPassword || this.password.length < 3) {
      throw Error('Passwords do not match or it is not at least 8 chars');
    }
    try {
      await this.uke.getUserInfo(this.userId);
      await this.notifService.generalErrorAlert(
        'This user id already exists, try another one!'
      );
    } catch {
      console.log("user doesnt exist - creating a new one")
      await this.keyring.createNewAccount(
        this.userId,
        this.password,
        this.verifyPassword
      );
      const current = await this.keyring.loadAccount();
      current.keypair.unlock(this.password);
      await this.uke.assignUsername(this.userId, current.keypair);
      current.keypair.lock();
      await this.keyring.auth(this.password, current.keypair);
      await this.router.navigate(['/tabs/tab1']);
    }
  }
}
