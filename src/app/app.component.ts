import { Component } from '@angular/core';
import { KeyringService } from './services/keyring.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private keyring: KeyringService) {
    // One-time init of keyring service at the root of the app
    keyring.init().then((_) => _);
  }
}
