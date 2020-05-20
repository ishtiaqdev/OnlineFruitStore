import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AmountModel, UserModel } from '../_models';

@Injectable()
export class DataService {

  private headers = new HttpHeaders({ 'Content-Type': 'application/json', 'charset': 'UTF-8' });

  constructor(private http: HttpClient) { }

  getProducts() {
      return this.http.get('/products').pipe(map(res => res));
  }  

	getProductById(id: number) {
		return this.http.get('/products/' + id + '').pipe(map(res => res));
	}

  getSelectedProducts(userid: number) {
      return this.http.get('/selectedproducts/' + userid + '').pipe(map(res => res));
  }  

  addProduct(product: any) {
      return this.http.post("/selectedproducts", JSON.stringify(product), { headers: this.headers });
  }

  editProduct(product: any) {
      return this.http.post("/updateselectedproducts", JSON.stringify(product), { headers: this.headers });
  }

  deleteProduct(product: any) {
      return this.http.post("/deleteselectedproducts", JSON.stringify(product), { headers: this.headers });
  }

  getTotal(userid: number) {
      return this.http.get<AmountModel>('/calculateTotal/' + userid + '').pipe(map(res => res));
  }

  getTotalAfterCoupon(userid: number, couponValue: string) {
    return this.http.get<AmountModel>('/calculateTotalAfterCoupon/' + userid + '/' + couponValue + '').pipe(map(res => res));
  } 

  createPaypalTransacton(orderDetail: UserModel){
    return this.http.post('/submitorder', orderDetail);
  }
}
