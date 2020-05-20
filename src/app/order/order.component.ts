import { Component, OnInit } from '@angular/core';
import { ModalModule } from '../../../node_modules/ng2-bs4-modal/lib/ng2-bs4-modal.module'

import { ToastComponent } from '../shared/toast/toast.component';
import { DataService, LoginService } from '../services';
import { UserModel, AmountModel } from '../_models';

@Component({
   selector: 'app-order',
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

    products: any = [];
	selectedproducts: any = [];
    isLoading = true;
    isDataLoading = true;

    product: any = {};

    modalname = "";
    imagepath = "";
    productprice = "";
    productQty = 1;

    isEditing = false;
    amount: AmountModel = new AmountModel();
    enableDiscount: string;
    subTotal: any;

    loading = false;
    currentUser: UserModel;
    userid: number = 0;

    constructor(private dataService: DataService,
        private loginService: LoginService,
        private toast: ToastComponent) 
        {
            this.loginService.currentUser.subscribe(x => this.currentUser = x);
            if(this.currentUser != null)
                this.userid = this.currentUser.id;
        }

    ngOnInit() {
          this.isDataLoading = true;
          this.selectedproducts = [];
		  this.getSelectedProducts(this.userid);
          this.getTotalAmount(this.userid);
	  }

    getProducts() {
        this.dataService.getProducts().subscribe(
            data => this.products = data,
            error => console.log(error),
                () => this.isLoading = false
            );
    }
    
    onCouponApply(couponValue: string) {
        this.loading = true;
        if(couponValue != null)
        {
            this.getTotalAmountAfterApplyingCoupon(this.userid, couponValue);
        }
        else
        {
            this.toast.setMessage("Please enter a coupon.", "danger");
        }
    }

	getSelectedProducts(userid: number) {
        this.dataService.getSelectedProducts(userid).subscribe(
            data => {
			    this.selectedproducts = data
			},
            error => console.log(error),
                () => this.isDataLoading = false
            );
    }

    loadProduct(product: any) {
        this.productQty = product.quantity;
        this.modalname = product.info.name;
        this.imagepath = product.info.image;
        this.productprice = product.info.price;
        this.product = product;
    }

    editProduct(product: any) {
        let selectedproduct = { id: product.id, old_quantity: product.quantity, new_quantity: this.productQty, userid: this.userid };
        this.dataService.editProduct(selectedproduct).subscribe(
            res => {
                this.productQty = 1;
                this.toast.setMessage("Item edited successfully.", "success");
                this.getSelectedProducts(this.userid);
                this.getTotalAmount(this.userid);
            },
            error => console.log(error)
            );
    }

    deleteProduct(product: any) {
        if (window.confirm("Are you sure you want to permanently delete this item?")) {
            let selectedproduct = { id: product.id, quantity: product.quantity, userid: this.userid };
            this.dataService.deleteProduct(selectedproduct).subscribe(
                res => {
                    this.toast.setMessage("Item deleted successfully.", "success");
                    this.getSelectedProducts(this.userid);
                    this.getTotalAmount(this.userid);
                },
                error => console.log(error)
                );
        }
    }

    getTotalAmount(userid: number) {
        this.dataService.getTotal(userid).subscribe(
            data => {
                if(data != null)
                {
                    let amountModel = new AmountModel();
                    amountModel.coupon = data.coupon;
                    amountModel.couponMessage = data.couponMessage;
                    amountModel.couponStatus = data.couponStatus;
                    amountModel.discount = data.discount;
                    amountModel.enableDiscount = data.enableDiscount;
                    amountModel.netAmount = data.netAmount;
                    amountModel.subTotal = data.subTotal;
                    this.amount = amountModel;
                }
            },
            error => console.log(error),
                () => this.isLoading = false
            );
    }

    getTotalAmountAfterApplyingCoupon(userid: number, couponValue: string) {
        this.dataService.getTotalAfterCoupon(userid, couponValue).subscribe(
            data => {
                this.amount = data
                if(this.amount != null)
                {
                    let amountModel = new AmountModel();
                    amountModel.coupon = data.coupon;
                    amountModel.couponMessage = data.couponMessage;
                    amountModel.couponStatus = data.couponStatus;
                    amountModel.discount = data.discount;
                    amountModel.enableDiscount = data.enableDiscount;
                    amountModel.netAmount = data.netAmount;
                    amountModel.subTotal = data.subTotal;
                    this.amount = amountModel;

                    if(this.amount.couponStatus)
                        this.toast.setMessage(this.amount.couponMessage, "success");
                    else
                        this.toast.setMessage(this.amount.couponMessage, "danger");
                }
            },
            error => console.log(error),
                () => {
                    this.isLoading = false;
                    this.loading = false;
                }
            );
    }

    checkoutOrder() {
        this.dataService.createPaypalTransacton(this.currentUser).subscribe(
            data => {
                this.toast.setMessage(data, 'success');
            },
            error => {                
                    console.log(error),
                    this.toast.setMessage('There is an error in making payment.', 'danger');
                }
            );
    }

    onCheckoutClick() {
        this.checkoutOrder();
    }
}


