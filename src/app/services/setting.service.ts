import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable()
export class SettingService {
    constructor(private http: HttpClient) {
    }

    createFiveCoupons(seconds: string) {
        return this.http.get('/generatecoupons/' + seconds + '').pipe(map(res => res));
    }

    createProducts() {
        return this.http.get('/setup/').pipe(map(res => res));
    }
}