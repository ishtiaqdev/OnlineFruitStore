import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModalModule } from '../../node_modules/ng2-bs4-modal/lib/ng2-bs4-modal.module'
import { JwtModule } from '@auth0/angular-jwt';
import { NgxPayPalModule } from 'ngx-paypal';
import { AppComponent } from './app.component';

import { DashboardComponent } from './dashboard';
import { OrderComponent } from './order';
import { LoginComponent } from './login';
import { SignupComponent } from './signup';
import { SettingComponent } from './setting';
import { PaypalCheckoutComponent } from './order/paypalcheckout';
import { OrderConfirmationComponent } from './order-confirmation';
import { LoginService, DataService, SettingService } from './services';

import { ToastComponent } from './shared/toast/toast.component';
import { routing } from './app.routing';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    OrderComponent,
    LoginComponent,
    SignupComponent,
    SettingComponent,
    PaypalCheckoutComponent,
    OrderConfirmationComponent,
    ToastComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    routing,
    ModalModule,
    NgxPayPalModule,

    JwtModule.forRoot({
      config: {
        tokenGetter: function tokenGetter() {
          return localStorage.getItem('currentUser');
        },
        whitelistedDomains: ['localhost:3000'],
        blacklistedRoutes: ['http://localhost:3000/login/auth']
      }
    })
  ],
  providers: [
    DataService,
    LoginService,
    SettingService,
    ToastComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})

export class AppModule { }
