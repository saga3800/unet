import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../login/token';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { UtilsService } from '../utils.service';

@Component({
  selector: 'app-registrarArticulo',
  templateUrl: './registrar.component.html',
  styleUrls: ['./registrar.component.css']
})
export class registrarArticuloComponent {
  constructor(private router: Router, private http: HttpClient, public tokenService: TokenService, private route: ActivatedRoute, public utilsService: UtilsService) { this._id = this.route.snapshot.paramMap.get('id'); }

  /**
   * Control Error Textfields
   */
  codigoBarrasFormControl = new FormControl('', [Validators.required]);
  descripcionFormControl = new FormControl('', [Validators.required]);
  marcaFormControl = new FormControl('', [Validators.required]);
  referenciaFormControl = new FormControl('', [Validators.required]);
  unidadMedidaFormControl = new FormControl('', [Validators.required]);
  codigoUbicacionFormControl = new FormControl('', [Validators.required]);
  stockFormControl = new FormControl('', [Validators.required]);
  precioVentaFormControl = new FormControl('', [Validators.required]);
  precioMayoreoFormControl = new FormControl('', [Validators.required]);
  precioInternoFormControl = new FormControl('', [Validators.required]);
  isCentimetro: string = 'CEN';
  matcher = new MyErrorStateMatcher();

  _id: string | null;
  tittleForm: string = "REGISTRAR ARTICULO"
  isLoadingResults: boolean = false;
  ubicaciones: any[] = [];

  articulosEncontrados: any[] = [];
  opened: boolean = false;
  mensajeExitoso: string = '';
  mensajeFallido: string = '';

  nuevoArticulo = {
    codigo: '',
    codigoBarras: '',
    descripcion: '',
    unidadMedida: '',
    codigoUbicacion: '',
    marca: '',
    referencia: '',
    stock: '',
    precioVenta: '',
    precioMayoreo: '',
    precioInterno: '',
    valorUnitario: '',
    impuestoUnitario: ''
  };


  async crearArticulo() {
    const url = 'https://p02--node-launet--m5lw8pzgzy2k.code.run/api/articles';
    const body = {
      codigoBarras: this.nuevoArticulo.codigoBarras,
      descripcion: this.nuevoArticulo.descripcion,
      unidadMedida: this.nuevoArticulo.unidadMedida,
      codigoUbicacion: this.nuevoArticulo.codigoUbicacion,
      referencia: this.nuevoArticulo.referencia,
      marca: this.nuevoArticulo.marca,
      stock: this.nuevoArticulo.stock,
      precioVenta: this.nuevoArticulo.precioVenta
    };
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`
      })
    };
    this.isLoadingResults = true;
    try {
      const response = await this.http.post(url, body, httpOptions).toPromise();
      this.mensajeExitoso = "Artículo guardado correctamente.";
      setTimeout(() => {
        this.refreshPage();
      }, 1000);
    } catch (error) {
      this.mensajeFallido = 'Error al guardar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    this.cargarUbicaciones();
    this.cargarEditarArticulo();
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

  async cargarEditarArticulo() {
    if (this._id !== null) {
      this.tittleForm = "EDITAR ARTICULO";
      const token = this.tokenService.token;
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'x-access-token': `${token}`,
        })
      };
      this.isLoadingResults = true;
      try {
        this.http.get<any>(`https://p02--node-launet--m5lw8pzgzy2k.code.run/api/articles/${this._id}`, httpOptions)
          //this.http.get<any>(`http://localhost:8080/api/articles/${this._id}`, httpOptions)
          .subscribe(response => {
            if (response.Status) {
              this.nuevoArticulo.codigoBarras = response.Data.docs[0].codigoBarras;
              this.nuevoArticulo.descripcion = response.Data.docs[0].descripcion;
              this.nuevoArticulo.marca = response.Data.docs[0].marca;
              this.nuevoArticulo.referencia = response.Data.docs[0].referencia;
              this.nuevoArticulo.unidadMedida = response.Data.docs[0].unidadMedida;
              this.nuevoArticulo.codigoUbicacion = response.Data.docs[0].codigoUbicacion;
              this.nuevoArticulo.stock = response.Data.docs[0].inventarios[0] ? response.Data.docs[0].inventarios[0].stock : 0;
              this.nuevoArticulo.precioVenta = response.Data.docs[0].precios[0] ? response.Data.docs[0].precios[0].precioVenta : 0;
              this.nuevoArticulo.precioMayoreo = response.Data.docs[0].precios[0] ? response.Data.docs[0].precios[0].precioMayoreo : 0;
              this.nuevoArticulo.precioInterno = response.Data.docs[0].precios[0] ? response.Data.docs[0].precios[0].precioInterno : 0;
              this.nuevoArticulo.valorUnitario = response.Data.docs[0].precios[0] ? response.Data.docs[0].precios[0].valorUnitario : 0;
              this.nuevoArticulo.impuestoUnitario = response.Data.docs[0].precios[0] ? response.Data.docs[0].precios[0].impuestoUnitario : 0;
              if ( this.utilsService.calcularInterno(this.nuevoArticulo.valorUnitario, this.nuevoArticulo.impuestoUnitario) !== this.utilsService.numeros(this.nuevoArticulo.precioInterno)) {
                this.nuevoArticulo.precioInterno = this.nuevoArticulo.unidadMedida === this.isCentimetro? response.Data.docs[0].precios[0].precioInterno: this.utilsService.calcularInterno(this.nuevoArticulo.valorUnitario, this.nuevoArticulo.impuestoUnitario)
              }
            }
          }, error => {
            if (error.status === 401) {
              this.routerLinkLogin();
            }
            this.mensajeFallido = 'Error al consultar. Por favor, revisar la consola de Errores.';
            console.error('Error en la solicitud:', error);
          });
      } catch (error) {
        this.mensajeFallido = 'Error al consultar. Por favor, revisar la consola de Errores.';
        console.error('Error en la solicitud:', error);
      }
      this.isLoadingResults = false;
    }
  }

  async editarArticulo() {
    const url = `https://p02--node-launet--m5lw8pzgzy2k.code.run/api/articles/${this._id}`
    //const url = `http://localhost:8080/api/articles/${this._id}`
    const body = {
      codigoBarras: this.nuevoArticulo.codigoBarras,
      descripcion: this.nuevoArticulo.descripcion,
      marca: this.nuevoArticulo.marca,
      referencia: this.nuevoArticulo.referencia,
      unidadMedida: this.nuevoArticulo.unidadMedida,
      codigoUbicacion: this.nuevoArticulo.codigoUbicacion,
      stock: this.nuevoArticulo.stock,
      precioVenta: this.nuevoArticulo.precioVenta,
      precioMayoreo: this.nuevoArticulo.precioMayoreo,
      precioInterno: this.nuevoArticulo.precioInterno
    };
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`
      })
    };
    this.isLoadingResults = true;
    try {
      const response = await this.http.patch(url, body, httpOptions).toPromise();
      this.isLoadingResults = false;
      this.mensajeExitoso = "Artículo actualizado exitosamente"
      setTimeout(() => {
        this.routerLinkBuscarArticulo();
      }, 500);
    } catch (error) {
      this.mensajeFallido = 'Error al editar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }

    this.isLoadingResults = false;
  }

  refreshPage() {
    window.location.reload();
  }
  routerLinkLogin(): void {
    this.router.navigate(['/login'])
  };
  routerLinkBuscarArticulo(): void {
    this.router.navigate(['/buscarArticulo'])
  };
}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}