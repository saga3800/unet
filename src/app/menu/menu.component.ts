import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../login/token';
import { LocalStorageService } from '../local-storage.service';
import { NavigationEnd, Router } from '@angular/router';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  opened: boolean = false;
  editingItem: any = null;
  isEditing: boolean = false;
  localStorageUser !: any;

  errorMessage: string = '';
  successMesssage: String = '';

  mostrarFormularioRegistrarUsuario: boolean = false;
  mostrarFormularioBuscarUsuario: boolean = false;

  constructor(private router: Router, private http: HttpClient, public tokenService: TokenService, public localStorageService: LocalStorageService) {
   }

   ngOnInit(): void {
    this.localStorageUser = this.localStorageService.getItem('user_key');
    if (!this.localStorageUser) {
      this.routerLinkLogin();
    }
   }

   routerLinkLogin(): void {
    this.router.navigate(['/login'])
  };

   registrarUsuario() {
    this.mostrarFormularioRegistrarUsuario = !this.mostrarFormularioRegistrarUsuario;
  }

  buscarUsuario() {
    this.mostrarFormularioBuscarUsuario = !this.mostrarFormularioBuscarUsuario;
  }
}
