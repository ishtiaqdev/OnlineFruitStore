import { Component, OnInit } from '@angular/core';
import { ModalModule } from '../../../node_modules/ng2-bs4-modal/lib/ng2-bs4-modal.module';

import { ToastComponent } from '../shared/toast/toast.component';
import { DataService, LoginService } from '../services';
import { UserModel } from '../_models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

    products: any = [];
    isLoading = true;

    product = {};
    selectedproduct = {};

    productSize = "";
    productColor = "";
    modalname = "";
    imagepath = "";
    productprice = "";
    productQty = 1;

    isEditing = false;

    currentUser: UserModel;
    userid: Number = 0;

    constructor(private dataService: DataService,
                private loginService: LoginService,
                private toast: ToastComponent) 
                { 
                    this.loginService.currentUser.subscribe(x => this.currentUser = x);
                    if(this.currentUser != null)
                        this.userid = this.currentUser.id;
                }

    ngOnInit() {
        this.getProducts();
    }

    getProducts() {
        this.dataService.getProducts().subscribe(
            data => this.products = data,
            error => console.log(error),
            () => this.isLoading = false
            );
    }

    loadProduct(product) {
        this.productQty = 1;
        this.modalname = product.name;
        this.imagepath = product.image;
        this.productprice = product.price;
        this.product = product;
    }
    
    addProduct(prod) {
        this.selectedproduct = { id: prod.id, quantity: this.productQty, userid: this.userid };
        this.dataService.addProduct(this.selectedproduct).subscribe(
            res => {
                this.productSize = "";
                this.productColor = "";
                this.productQty = 1;
                this.toast.setMessage("Item added successfully.", "success");
            },
            error => console.log(error)
        );
    }
}
