import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {TokenService} from './token'
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { LocalStorageService } from '../local-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  matcher = new MyErrorStateMatcher();
  hide = true;
  email: string = '';
  password: string = '';
  isLoadingResults: boolean = false;
  authenticationError: boolean = false;
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passwordFormControl = new FormControl('', [Validators.required, Validators.pattern('(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}')]);

  constructor(private router: Router, private http: HttpClient, public tokenService: TokenService,  public localStorageService: LocalStorageService,) { }

  ngOnInit() {
    this.localStorageService.clear();
  }
  
  async login() {
    const loginUrl = 'https://p02--node-launet--m5lw8pzgzy2k.code.run/api/auth/login';
    const body = {
      email: this.email,
      password: this.password
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    let responseFromServer: any;
    try {
    this.isLoadingResults= true;
      responseFromServer = await new Promise((resolve, reject) => {
        this.http.post(loginUrl, body, httpOptions).subscribe(
          result => {
            const jsonResponse = result as any; 
            //const token = jsonResponse?.Data[0].token;
            //this.tokenService.token = token;
            this.tokenService.user = jsonResponse?.Data;
            resolve(result);
          },
          err => {
            this.isLoadingResults= false;
            console.error("entro a error", err);
            reject(err);
          }
        );
      });
      this.isLoadingResults= false;
      if (responseFromServer) {
        this.router.navigate(['/menu']);
      }
    } catch (error) {
      this.isLoadingResults= false;
      console.error('Error en la solicitud:', error);
      this.authenticationError = true;
    }
  }
}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}