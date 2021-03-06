import { Component } from '@angular/core';

import {AuthService} from './vguard/auth-service/auth.service';
import {UserService} from './share-module/dependency-injection/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  isHighlight = false;

  constructor(
    private authService: AuthService,
    public userService: UserService
  ) { }

  tooglelogin() {
    this.isHighlight = !this.isHighlight;

    if (this.isHighlight) {
      this.authService.login();
      this.userService.data.textSlogan = 'Welcome You - Dependency Injection (share-module)';
    }else
      this.authService.logout();
  }
}
