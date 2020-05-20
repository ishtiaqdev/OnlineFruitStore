import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './_guards';
import { DashboardComponent } from './dashboard';
import { OrderComponent } from './order';
import { LoginComponent } from './login';
import { SignupComponent } from './signup';
import { SettingComponent } from './setting';
import { OrderConfirmationComponent } from './order-confirmation';

const appRoutes: Routes = [
    { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'order', component: OrderComponent, canActivate: [AuthGuard] },
    { path: 'order-confirmation', component: OrderConfirmationComponent, canActivate: [AuthGuard]},
    { path: 'setting', component: SettingComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);