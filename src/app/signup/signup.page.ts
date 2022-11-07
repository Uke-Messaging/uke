import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeyringService } from '../services/keyring.service';
import { UkePalletService } from '../services/ukepallet.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  loginSwitch: boolean = false;

  userId: string = 'sadf';
  password: string = 'password';
  verifyPassword: string = 'password';
  switchText: string = 'already have an account?';

  constructor(
    private keyring: KeyringService,
    private router: Router,
    private uke: UkePalletService
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
      await this.keyring.auth(this.password, keypair.keypair);
      await this.router.navigate(['/tabs/tab1']);
    } catch {
      console.log('YEAH');
      alert('UNABLE TO AUTHENTICATE USER, BAD PASSWORD OR NOT CREATED.');
    }
  }

  async signup() {
    if (this.password !== this.verifyPassword || this.password.length < 8) {
      throw Error('Passwords do not match or it is not at least 8 chars');
    }
    try {
      const current = await this.keyring.loadAccount();
      alert(`Existing account ${current.keypair.meta.name} exists`);
    } catch {
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
