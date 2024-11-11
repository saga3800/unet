import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../login/token';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { LocalStorageService } from '../local-storage.service';

@Component({
  selector: 'app-registrarUbicacion',
  templateUrl: './registrar.component.html',
  styleUrls: ['./registrar.component.css']
})
export class registrarUbicacionComponent {

  constructor(private router: Router,private http: HttpClient, public tokenService: TokenService, private route: ActivatedRoute,public localStorageService: LocalStorageService) 
  { this._id = this.route.snapshot.paramMap.get('id'); }

  /**
 * Control Error Textfields
 */

  nombreZonaFormControl = new FormControl('', [Validators.required]);
  numeroZonaFormControl = new FormControl('', [Validators.required]);
  numeroEstanteriaFormControl = new FormControl('');
  numeroUbicacionFormControl = new FormControl('');
  matcher = new MyErrorStateMatcher();

  _id: string | null;
  tittleForm: string = "REGISTRAR UBICACION"
  ubicaciones: any[] = [];
  proveedores: any[] = [];
  opened: boolean = false;
  isLoadingResults: boolean = false;
  ubicacionesEncontrados: any[] = [];
  localStorageUser !: any;
  mensajeExitoso: string = '';
  mensajeFallido: string = '';
  nuevaUbicacion = {
    zona: '',
    numeroZona: '',
    estante: '',
    ubicacion: ''
  };

  ngOnInit(): void {
    this.localStorageUser = this.localStorageService.getItem('user_key');
    if (!this.localStorageUser) {
      this.routerLinkLogin();
    }
    this.cargarEditarUbicacion();
  }

  async crearUbicacion() {
    const url = 'https://p02--node-launet--m5lw8pzgzy2k.code.run/api/locations';
    const body = {
      nombreZona: this.nuevaUbicacion.zona.substring(0, 10),
      numeroZona: this.nuevaUbicacion.numeroZona,
      numeroEstanteria: this.nuevaUbicacion.estante,
      numeroUbicacion: this.nuevaUbicacion.ubicacion
    };

    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`
      })
    };
    this.isLoadingResults= true;
    try {
      const response = await this.http.post(url, body, httpOptions).toPromise();
      this.isLoadingResults= false;
      this.mensajeExitoso = 'Ubicación guardada exitosamente';
      setTimeout(() => {
        this.refreshPage();
      }, 3000);
    } catch (error) {
      this.isLoadingResults= false;
      this.mensajeFallido = 'Error al crear. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

  async cargarEditarUbicacion() {
    if (this._id !== null) {
      this.tittleForm = "EDITAR UBICACION";
      const token = this.tokenService.token;
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'x-access-token': `${token}`,
        })
      };
      this.isLoadingResults= true;
      try {
        this.http.get<any>(`https://p02--node-launet--m5lw8pzgzy2k.code.run/api/locations/${this._id}`, httpOptions)
          .subscribe(response => {
            if (response.Status) {
              this.nuevaUbicacion.zona = response.Data.nombreZona;
              this.nuevaUbicacion.numeroZona = response.Data.numeroZona;
              this.nuevaUbicacion.estante = response.Data.numeroEstanteria;
              this.nuevaUbicacion.ubicacion = response.Data.numeroUbicacion;
            }
            this.isLoadingResults= false;
          }, error => {
            this.isLoadingResults= false;
            if (error.status === 401) {
              this.routerLinkLogin();
            }
            this.mensajeFallido = 'Error al consultar. Por favor, revisar la consola de Errores.';
            console.error('Error en la solicitud:', error);
          }); 
      } catch (error) {
        this.isLoadingResults= false;
        this.mensajeFallido = 'Error al consultar. Por favor, revisar la consola de Errores.';
        console.error('Error en la solicitud:', error);
      }
    }
  }

  async editarUbicacion() {
    const url = `https://p02--node-launet--m5lw8pzgzy2k.code.run/api/locations/${this._id}`
    const body = {
      nombreZona: this.nuevaUbicacion.zona.substring(0, 10),
      numeroZona: this.nuevaUbicacion.numeroZona,
      numeroEstanteria: this.nuevaUbicacion.estante,
      numeroUbicacion: this.nuevaUbicacion.ubicacion
    };
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`
      })
    };
    this.isLoadingResults= true;
    try {
      const response = await this.http.patch(url, body, httpOptions).toPromise();
      this.isLoadingResults= false;
      this.mensajeExitoso = "Ubicación actualizada exitosamente"
      setTimeout(() => {
        this.refreshPage();
      }, 3000);
    } catch (error) {
      this.isLoadingResults= false;
      this.mensajeFallido = 'Error al editar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

  refreshPage() {
    window.location.reload()
  }
  routerLinkLogin(): void {
    this.router.navigate(['/login'])
  };
  
}

  /** Error when invalid control is dirty, touched, or submitted. */
  export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
      const isSubmitted = form && form.submitted;
      return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
  }