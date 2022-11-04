import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeyringService } from '../keyring.service';
import { UkePalletService } from '../ukepallet.service';

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

  constructor(private keyring: KeyringService, private router: Router, private uke: UkePalletService) {
    this.keyring.init().then((_) => _);
  }

  ngOnInit() {}

  switchLogin() {
    this.loginSwitch = !this.loginSwitch;
    if (this.loginSwitch) this.switchText = 'need to create an account?';
    else this.switchText = 'already have an account?';
  }

  async login() {
    try {
      const current = await this.keyring.getCurrentAccount(this.userId);
      current.unlock(this.password);
      if (!current.isLocked) {
        console.log(current.address);
        current.lock();
        await this.router.navigate(['/tabs/tab1']);
      }
    } catch {
      alert('WRONG PASSWORD FOR ACCOUNT');
    }
  }

  async signup() {
    if (this.password !== this.verifyPassword || this.password.length < 8) {
      throw Error('Passwords do not match or it is not at least 8 chars');
    }
    try {
      const current = await this.keyring.getCurrentAccount(this.userId);
      alert(`Existing account ${current.meta.name} exists`);
    } catch {
      await this.keyring.createNewAccount(
        this.userId,
        this.password,
        this.verifyPassword
      );
      const current = await this.keyring.getCurrentAccount(this.userId);
      current.unlock(this.password);
      await this.uke.assignUsername(this.userId, current);
      current.lock();
      await this.router.navigate(['/tabs/tab1']);
    }
  }
}
