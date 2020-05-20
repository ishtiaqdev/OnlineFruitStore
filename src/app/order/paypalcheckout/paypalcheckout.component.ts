import { Component, OnInit, Input } from '@angular/core';
import { ICreateOrderRequest, IPayPalConfig } from 'ngx-paypal';
import { Router } from '@angular/router';
import { DataService, LoginService } from '../../services';
import { UserModel } from '../../_models';


@Component({
  selector: 'app-paypal-checkout',
  templateUrl: './paypalcheckout.component.html'
})
export class PaypalCheckoutComponent implements OnInit {

  public payPalConfig?: IPayPalConfig;
  showSuccess: boolean = false;
  showCancel: boolean = false;
  showError: boolean = false;
  currency: string = 'EUR';
  currentUser: UserModel;
  
  @Input() totalAmount: number = 0;

  constructor(private router: Router, private checkoutService: DataService, private loginService: LoginService) 
  { 
    this.loginService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit() {
    this.initConfig();
  }

  private initConfig(): void {
      const self = this;

      self.payPalConfig = {
        currency: `${self.currency}`,
        clientId: 'Ab3l0gB8QNw6-EyPVS4VOVCAVEUqPdH4nu_80JvhTfQDes13ZaCs0l7tvXXgLOFWzt6mzLNELA2ywvXH',
        createOrderOnClient: (data) => <ICreateOrderRequest>{
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: `${self.currency}`,
              value: `${self.totalAmount}`,
              breakdown: {
                item_total: {
                  currency_code: `${self.currency}`,
                  value: `${self.totalAmount}`
                }
              }
            },
            items: [{
              name: 'Enterprise Subscription',
              quantity: '1',
              category: 'DIGITAL_GOODS',
              unit_amount: {
                currency_code: `${self.currency}`,
                value: `${self.totalAmount}`,
              },
            }]
          }]
        },
        advanced: {
          commit: 'true'
        },
        style: {
          label: 'checkout',
          layout: 'vertical',
          shape: 'rect',
          color: 'blue',
          size: 'large'
        },
        onApprove: (data, actions) => {
          console.log('onApprove - transaction was approved, but not authorized', data, actions);

          actions.order.get().then(details => {
            console.log('onApprove - you can get full order details inside onApprove: ', details);
          });
        },
        onClientAuthorization: (data) => {
          console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
          this.showSuccess = true;
          self.checkoutService.createPaypalTransacton(this.currentUser)
            .subscribe(data => {
              self.router.navigate(['/order-confirmation']);
            });

        },
        onCancel: (data, actions) => {
          console.log('OnCancel', data, actions);
          this.showCancel = true;

        },
        onError: err => {
          console.log('OnError', err);
          this.showError = true;
        },
        onClick: (data, actions) => {
          console.log('onClick', this.currentUser, actions);
          self.checkoutService.createPaypalTransacton(this.currentUser)
            .subscribe(data => {
                self.router.navigate(['/order-confirmation']);
                console.log(data)
            });
          this.resetStatus();
        },
      };
    }
    resetStatus() {
      console.log("Method not implemented.");
    }
}
