import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
//  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user_key';

  get token(): string | null {
    const token = JSON.parse(localStorage.getItem(this.USER_KEY)!);
    return token[0].token
  }

  /** 
  set token(value: string | null) {
    if (value) {
      localStorage.setItem(this.TOKEN_KEY, value);
    } else {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }
  */

  get user(): string | null {
    return JSON.parse(localStorage.getItem(this.USER_KEY)!);
  }

  set user(value: string | null) {
    if (value) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(this.USER_KEY);
    }
  }

  get userName(): string | null {
    const username = JSON.parse(localStorage.getItem(this.USER_KEY)!);
    return username[0].email
  }

  get rolName(): string | null {
    let rolname = JSON.parse(localStorage.getItem(this.USER_KEY)!);
    for (let i = 0; i < rolname[0].roles.length; i++) {
      if (rolname[0].roles[i].name === "admin"){
        return rolname[0].roles[i].name;
      }
    }
    return null
  }
}
