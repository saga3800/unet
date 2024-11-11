import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../login/token';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';


@Component({
  selector: 'app-registrarCliente',
  templateUrl: './registrar.component.html',
  styleUrls: ['./registrar.component.css'],
})
export class registrarClienteComponent {

  constructor(private router: Router,private http: HttpClient, public tokenService: TokenService, private route: ActivatedRoute) 
  { this._id = this.route.snapshot.paramMap.get('id'); }


/**
 * Control Error Textfields
 */
   emailFormControl = new FormControl('', [Validators.required, Validators.email]);
   tipoDocumentoFormControl = new FormControl('', [Validators.required]);
   numeroDocumentoFormControl = new FormControl('', [Validators.required]);
   nombreRazonSocialFormControl = new FormControl('', [Validators.required]);
   telefonoFormControl = new FormControl('', [Validators.required]);
   direccionFormControl = new FormControl('', [Validators.required]);
   departamentoFormControl = new FormControl('', [Validators.required]);
   municipioFormControl = new FormControl('', [Validators.required]);
   barrioFormControl = new FormControl('', [Validators.required]);
   tipoClienteFormControl = new FormControl('', [Validators.required]);
   matcher = new MyErrorStateMatcher();

 _id: string | null;
 tittleForm: string = "REGISTRAR CLIENTE"  
 opened: boolean = false;
 isLoadingResults: boolean = true;
 //isChecked : boolean = true;

  nuevoCliente: any = {
    tipoDocumento: '',
    numeroDocumento: '',
    nombreRazonSocial: '',
    telefono: '',
    extension: "",
    direccion: '',
    departamento: '',
    municipio: '',
    email: '',
    tipoCliente: '',
    barrio:''
  };
  
  proveedoresEncontrados: any[] = [];
  mensajeExitoso: string = '';
  mensajeFallido: string = '';

  ngOnInit(): void {
    this.isLoadingResults= false;
    this.cargarEditarCliente();
  }

  async guardarCliente() {
    const url = `https://p02--node-launet--m5lw8pzgzy2k.code.run/api/customers`
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`
      })
    };
    this.isLoadingResults= true;
    try {
      const response = await this.http.post(url,this.nuevoCliente, httpOptions).toPromise();
      this.isLoadingResults= false;
      this.mensajeExitoso = "Cliente guardado exitosamente"
      setTimeout(() => {
        this.refreshPage();
      }, 3000);
    } catch (error) {
      this.isLoadingResults= false;
      this.mensajeFallido = 'Error al guardar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }


  async cargarEditarCliente() {
    if (this._id !== null) {
      this.tittleForm = "EDITAR CLIENTE";
      const token = this.tokenService.token;
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'x-access-token': `${token}`,
        })
      };
      this.isLoadingResults= true;
      try {
        this.http.get<any>(`https://p02--node-launet--m5lw8pzgzy2k.code.run/api/customers/${this._id}`, httpOptions)
          .subscribe(response => {
            if (response.Status) {
              this.nuevoCliente.tipoDocumento = response.Data.tipoDocumento,
              this.nuevoCliente.numeroDocumento = response.Data.numeroDocumento,
              this.nuevoCliente.nombreRazonSocial = response.Data.nombreRazonSocial,
              this.nuevoCliente.telefono = response.Data.telefono,
              this.nuevoCliente.direccion = response.Data.direccion,
              this.nuevoCliente.departamento = response.Data.departamento,
              this.nuevoCliente.municipio = response.Data.municipio,
              this.nuevoCliente.email = response.Data.email,
              this.nuevoCliente.barrio = response.Data.barrio,
              this.nuevoCliente.tipoCliente = response.Data.tipoCliente
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

  async editarCliente() {
    const url = `https://p02--node-launet--m5lw8pzgzy2k.code.run/api/customers/${this._id}`
    const body = {
      tipoDocumento: this.nuevoCliente.tipoDocumento,
      numeroDocumento: this.nuevoCliente.numeroDocumento,
      nombreRazonSocial: this.nuevoCliente.nombreRazonSocial,
      telefono: this.nuevoCliente.telefono,
      direccion: this.nuevoCliente.direccion,
      departamento: this.nuevoCliente.departamento,
      municipio: this.nuevoCliente.municipio,
      email: this.nuevoCliente.email,
      barrio: this.nuevoCliente.barrio,
      tipoCliente: this.nuevoCliente.tipoCliente
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
      const response = await this.http.patch(url,body, httpOptions).toPromise();
      this.isLoadingResults= false;
      this.mensajeExitoso = "Proveedor actualizado exitosamente"
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
    this.isLoadingResults= false;
    window.location.reload();
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
