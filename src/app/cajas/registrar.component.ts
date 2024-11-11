import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../login/token';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';


@Component({
  selector: 'app-registrarCaja',
  templateUrl: './registrar.component.html',
  styleUrls: ['./caja.component.css'],
})
export class RegistrarCajaComponent {

  constructor(private router: Router,private http: HttpClient, public tokenService: TokenService, private route: ActivatedRoute) 
  { this._id = this.route.snapshot.paramMap.get('id'); }


/**
 * Control Error Textfields
 */
   nombreFormControl = new FormControl('', [Validators.required]);
   ubicacionFormControl = new FormControl('', [Validators.required]);
   tipoCajaFormControl = new FormControl('', [Validators.required]);
   estadoActivoFormControl = new FormControl('', [Validators.required]);

   matcher = new MyErrorStateMatcher();

 _id: string | null;
 tittleForm: string = "REGISTRAR CAJA"  
 opened: boolean = false;
 isLoadingResults: boolean = true;
 //isChecked : boolean = true;

  nuevaCaja: any = {
    nombre: '',
    ubicacion: '',
    tipoCaja: '',
    estadoActivo: true
  };
  
  ubicaciones: any[] = [];
  mensajeExitoso: string = '';
  mensajeFallido: string = '';

  ngOnInit(): void {
    this.isLoadingResults= false;
    this.cargarUbicaciones();
    this.cargarEditarCaja();
  }

  async guardarCaja() {
    const url = `https://p01--node-launet2--m5lw8pzgzy2k.code.run/api/cashiers`
    //const url = `http://localhost:3030/api/cashiers`
    const token = this.tokenService.token;
    //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2M3YzI2ZDI5NDRiMmM2MWFiZWQ5NCIsImlhdCI6MTcxMjUwNTYxMCwiZXhwIjoxNzEyNTkyMDEwfQ.qdlwQKUZJ81BKpfGWEpBNnm2N_5l4g0yZo9GedqwJ7s";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`
      })
    };
    this.isLoadingResults= true;
    try {
      const response = await this.http.post(url,this.nuevaCaja, httpOptions).toPromise();
      this.isLoadingResults= false;
      this.mensajeExitoso = "Caja guardada exitosamente"
      setTimeout(() => {
        this.refreshPage();
      }, 3000);
    } catch (error) {
      this.isLoadingResults= false;
      this.mensajeFallido = 'Error al guardar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

  async cargarUbicaciones() {
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`
      })
    };
    this.isLoadingResults = true;
    try {
      this.http.get<any>('https://p02--node-launet--m5lw8pzgzy2k.code.run/api/locations', httpOptions)
        .subscribe(response => {
          if (response.Status) {
            this.ubicaciones = response.Data.docs;
          }
          this.isLoadingResults = false;
        }, error => {
          this.isLoadingResults = false;
          if (error.status === 401) {
            this.routerLinkLogin();
          }
          this.mensajeFallido = 'Error al consultar Ubicaciones. Por favor, revisar la consola de Errores.';
          console.error('Error en la solicitud:', error);
        });
    } catch (error) {
      this.isLoadingResults = false;
      this.mensajeFallido = 'Error al consultar Ubicaciones. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

  async cargarEditarCaja() {
    if (this._id !== null) {
      this.tittleForm = "EDITAR CAJA";
      const token = this.tokenService.token;
      //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2M3YzI2ZDI5NDRiMmM2MWFiZWQ5NCIsImlhdCI6MTcxMjUwNTYxMCwiZXhwIjoxNzEyNTkyMDEwfQ.qdlwQKUZJ81BKpfGWEpBNnm2N_5l4g0yZo9GedqwJ7s";
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'x-access-token': `${token}`,
        })
      };
      this.isLoadingResults= true;
      try {
        this.http.get<any>(`https://p01--node-launet2--m5lw8pzgzy2k.code.run/api/cashiers/${this._id}`, httpOptions)
        //this.http.get<any>(`http://localhost:3030/api/cashiers/${this._id}`, httpOptions)
          .subscribe(response => {
            if (response.Status) {
              this.nuevaCaja.nombre = response.Data[0].nombre,
              this.nuevaCaja.ubicacion = response.Data[0].ubicacion,
              this.nuevaCaja.tipoCaja = response.Data[0].tipoCaja,
              this.nuevaCaja.estadoActivo = response.Data[0].estadoActivo
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

  async editarCaja() {
    const url = `https://p01--node-launet2--m5lw8pzgzy2k.code.run/api/cashiers/${this._id}`
    //const url = `http://localhost:3030/api/cashiers/${this._id}`
    const body = {
      nombre: this.nuevaCaja.nombre,
      ubicacion: this.nuevaCaja.ubicacion,
      tipoCaja: this.nuevaCaja.tipoCaja,
      estadoActivo: this.nuevaCaja.estadoActivo,
    };
    const token = this.tokenService.token;
    //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2M3YzI2ZDI5NDRiMmM2MWFiZWQ5NCIsImlhdCI6MTcxMjUwNTYxMCwiZXhwIjoxNzEyNTkyMDEwfQ.qdlwQKUZJ81BKpfGWEpBNnm2N_5l4g0yZo9GedqwJ7s";
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
        this.routerLinkBuscarCajaAbierta();
      }, 3000);
    } catch (error) {
      this.isLoadingResults= false;
      this.mensajeFallido = 'Error al editar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

  onToggleVerify(estadoActivo: any) {
    this.nuevaCaja.estadoActivo = estadoActivo
  }

  refreshPage() {
    this.isLoadingResults= false;
    window.location.reload();
  }

  routerLinkLogin(): void {
    this.router.navigate(['/login'])
  };

  routerLinkBuscarCajaAbierta(): void {
    this.router.navigate(['/buscarCaja'])
  };
}

  /** Error when invalid control is dirty, touched, or submitted. */
  export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
      const isSubmitted = form && form.submitted;
      return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
  }
