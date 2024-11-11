
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TokenService } from '../login/token';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { LocalStorageService } from '../local-storage.service';

@Component({
  selector: 'app-dialogo.articulo',
  templateUrl: './dialogo.articulo.component.html',
  styleUrls: ['./dialogo.articulo.component.css']
})
export class DialogoArticuloComponent implements OnInit {

  columnas: string[] = ['codigo', 'codigoBarras', 'descripcion', 'marca', 'referencia', 'unidadMedida', 'accion'];

  matcher = new MyErrorStateMatcher();
  isLoadingResults: boolean = false;
  dataSourceArticulos: any = [];
  mensajeExitoso: string = '';
  mensajeFallido: string = '';
  /**
   * Control Error Textfields Articles
   */
  descripcionFormControl = new FormControl('');
  codigoBarrasFormControl = new FormControl('');
  consultarArticulo = {
    descripcion: '',
    codigoBarras:''
  };

  constructor(
    public dialogo: MatDialogRef<DialogoArticuloComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string, @Inject(TokenService) public tokenService: TokenService, @Inject(HttpClient) private http: HttpClient,
    @Inject(LocalStorageService) private localStorageService: LocalStorageService) { }

  seleccionar(element: any): void {
    const found = this.localStorageService.getItem(element._id);
    if (found) {
      alert("Articulo ya seleccionado");
    } else {
      this.dialogo.close(element);
    }
  }

  cerrar(): void {
    this.dialogo.close(null);
  }

  ngOnInit() {
  }

  async buscarArticulo(process: number) {
    this.mensajeFallido = "";
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`,
      })
    };

    let httpParams = new HttpParams();
    httpParams = process === 0? httpParams.append('descripcion', this.consultarArticulo.descripcion): httpParams.append('codigoBarras', this.consultarArticulo.codigoBarras);
    this.isLoadingResults = true;
    try {
      this.isLoadingResults = true;
      this.http.get<any>(`https://p01--node-launet2--m5lw8pzgzy2k.code.run/api/detailArticle?${httpParams}`, httpOptions)
        .subscribe(response => {
          if (response.Status) {
            this.dataSourceArticulos = new MatTableDataSource(response.Data.docs)
            if(response.Data.totalDocs === 0){
              this.mensajeFallido = 'Articulo no encontrado';
            }
          }
          this.isLoadingResults = false;
        }, error => {
          this.isLoadingResults = false;
          this.mensajeFallido = 'Error al consultar. Por favor, revisar la consola de Errores.';
          console.error('Error en la solicitud:', error);
        });
    } catch (error) {
      this.mensajeFallido = 'Error al consultar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

};

export class Articulo {
  constructor(public codigo: string, public codigoBarras: string, public descripcion: String, public marca: string, public referencia: string,
    public unidadMedida: String, public codigoUbicacion: string, public estadoActivo: boolean, public precioVenta: string,
    public ivaCompra: String, public subtotalCompra: string, public totalCompra: string
  ) { }
}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}