import { Component, OnInit } from '@angular/core';

import { ToastComponent } from '../shared/toast/toast.component';
import { SettingService } from '../services';

@Component({ 
    templateUrl: './setting.component.html',
    styleUrls: ['./setting.component.css']
 })
export class SettingComponent implements OnInit {
    loading = false;
    isLoading = true;
    data: any;

    constructor(
        private settingService: SettingService,
        private toast: ToastComponent
    ) { }

    ngOnInit() {
        this.isLoading = false;
    }

    onCreateCouponsClick(seconds: string) {
        this.loading = true;
        if(seconds != null) {
            this.getTotalAmountAfterApplyingCoupon(seconds);
        } else {
            this.toast.setMessage("Please enter seconds.", "danger");
        }
    }
    
    onSetupProductsClick() {
        this.loading = true;
        this.setupProdcuts();
    }

    getTotalAmountAfterApplyingCoupon(seconds: string) {
        this.settingService.createFiveCoupons(seconds).subscribe(
            data => {
                this.data = data
                this.loading = false;
            },
            error => console.log(error),
                () => {
                    this.isLoading = false;
                    this.loading = false;
                }
        );
    }
    
    setupProdcuts() {
        this.settingService.createProducts().subscribe(
            data => {
                this.data = data
                this.loading = false;
            },
            error => console.log(error),
                () => {
                    this.isLoading = false;
                    this.loading = false;
                }
        );
    }
}
