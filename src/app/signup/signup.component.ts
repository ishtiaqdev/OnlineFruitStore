import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { ToastComponent } from '../shared/toast/toast.component';
import { LoginService } from '../services';

@Component({ templateUrl: 'signup.component.html' })
export class SignupComponent implements OnInit {
    signupForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;

    constructor(
        private formBuilder: FormBuilder,
        private loginService: LoginService,
        private toast: ToastComponent
    ) { }

    ngOnInit() {
        this.signupForm = this.formBuilder.group({
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        // reset login status
        this.loginService.logout();
    }

    // convenience getter for easy access to form fields
    get f() { return this.signupForm.controls; }

    onSignupSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.signupForm.invalid) {
            return;
        }

        this.loading = true;
        this.loginService.signup(this.f.firstname.value, this.f.lastname.value, this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                data => {
                    if(data.indexOf('error') > -1)
                    {
                        this.loading = false;
                        this.toast.setMessage(data, "danger");
                    }
                    else
                    {
                        this.loading = false;
                        this.toast.setMessage(data, "success");
                    }
                },
                error => {
                    this.toast.setMessage(error, "danger")
                    this.loading = false;
                });
    }
}
