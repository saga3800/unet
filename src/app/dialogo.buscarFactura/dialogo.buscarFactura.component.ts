
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TokenService } from '../login/token';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-dialogo.buscarFactura',
  templateUrl: './dialogo.buscarFactura.component.html',
  styleUrls: ['./dialogo.buscarFactura.component.css']
})
export class DialogoBuscarFacturaComponent implements OnInit {

  columnas: string[] = ['numeroFactura', 'fechaFactura', 'efectivo', 'transferencia', 'total', 'vendedor', 'facturaElectronica', 'numeroDevolucion', 'accion'];

  matcher = new MyErrorStateMatcher();
  isLoadingResults: boolean = false;
  dataSourceFactura: any = [];
  mensajeExitoso: string = '';
  mensajeFallido: string = '';
    /**
   * Control Error Textfields
   */
    cotizacionFacturaFormControl = new FormControl('');
    consultar = {
      cotizacionFactura: '',
    };

  constructor(
    public dialogo: MatDialogRef<DialogoBuscarFacturaComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string, @Inject(TokenService) public tokenService: TokenService, @Inject(HttpClient) private http: HttpClient, private router: Router) { }

  seleccionar(element: any): void {
    this.dialogo.close(element);
  }

  cerrar(): void {
    this.dialogo.close(null);
  }

  ngOnInit() {
  }

  async buscarFactura() {
    this.mensajeFallido = "";
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`,
      })
    };
    if(this.consultar.cotizacionFactura == ""){
      this.mensajeFallido = 'Ingrese Numero de Factura'
      return;
    }
    let httpParams = new HttpParams();
    httpParams = httpParams.append('numeroFactura', this.consultar.cotizacionFactura);
    try {
      this.isLoadingResults = true;
      this.http.get<any>(`https://p01--node-launet2--m5lw8pzgzy2k.code.run/api/sales?${httpParams}`, httpOptions)
      //this.http.get<any>(`http://localhost:3030/api/sales?${httpParams}`, httpOptions)
        .subscribe(response => {
          if (response.Status) {
            this.dataSourceFactura = new MatTableDataSource(response.Data.docs)
            if (response.Data.docs.length === 0) {
              this.mensajeFallido = 'Factura no encontrada';
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