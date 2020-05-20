import { Component } from '@angular/core';
import { LoginService } from './services';
import { UserModel } from './_models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent { 
  currentUser: UserModel;
  constructor(
      private router: Router,
      private loginService: LoginService
  ) 
  {
      this.loginService.currentUser.subscribe(x => this.currentUser = x);
      if(this.currentUser)
      {
        this.router.navigate(['/order']);
      }
  }

  logout() {
      this.loginService.logout();
      this.router.navigate(['/login']);
  }
}
