
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TokenService } from '../login/token';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-dialogo.buscarCotizacion',
  templateUrl: './dialogo.buscarCotizacion.component.html',
  styleUrls: ['./dialogo.buscarCotizacion.component.css']
})
export class DialogoBuscarCotizacionComponent implements OnInit {

  columnas: string[] = ['cotizacion', 'subtotal', 'descuento', 'total', 'cliente', 'usuario', 'accion'];

  matcher = new MyErrorStateMatcher();
  isLoadingResults: boolean = false;
  dataSourceCotizacion: any = [];
  mensajeExitoso: string = '';
  mensajeFallido: string = '';
    /**
   * Control Error Textfields Articles
   */
    cotizacionFacturaFormControl = new FormControl('');
    consultar = {
      cotizacionFactura: '',
    };

  constructor(
    public dialogo: MatDialogRef<DialogoBuscarCotizacionComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string, @Inject(TokenService) public tokenService: TokenService, @Inject(HttpClient) private http: HttpClient, private router: Router) { }

  seleccionar(element: any): void {
    this.dialogo.close(element);
  }

  cerrar(): void {
    this.dialogo.close(null);
  }

  ngOnInit() {
    //this.buscarCotizacion();
  }

  async buscarCotizacion() {
    this.mensajeFallido = "";
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`,
      })
    };
    let httpParams = new HttpParams();
    httpParams = httpParams.append('numeroCotizacion', this.consultar.cotizacionFactura);
    try {
      this.isLoadingResults = true;
      this.http.get<any>(`https://p02--node-launet--m5lw8pzgzy2k.code.run/api/quotations?${httpParams}`, httpOptions)
        .subscribe(response => {
          if (response.Status) {
            this.dataSourceCotizacion = new MatTableDataSource(response.Data)
            if (response.Data.length === 0) {
              this.mensajeFallido = 'Cotizacion no encontrada';
            }
          }
          this.isLoadingResults = false;
        }, error => {
          this.isLoadingResults = false;
          if (error.status === 401) {
            this.routerLinkLogin();
          }
          if (error.status === 404) {
            this.mensajeFallido = 'Numero de cotización no encontrada.';
            return;
          }
          console.error('Error en la solicitud:', error);
        });
    } catch (error) {
      this.mensajeFallido = 'Error al consultar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

  routerLinkLogin(): void {
    this.router.navigate(['/login'])
  };

};


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}