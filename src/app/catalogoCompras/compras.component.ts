import { ChangeDetectorRef, Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TokenService } from '../login/token';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { DialogoConfirmacionComponent } from "../dialogo.confirmacion/dialogo.component";
import { DialogoArticuloComponent } from "../dialogo.articulo/dialogo.articulo.component";
import { NavigationEnd, Router } from '@angular/router';
import { Target } from '@angular/compiler';
import { LocalStorageService } from '../local-storage.service';
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { filter } from 'rxjs';
import { UtilsService } from '../utils.service';

@Injectable({
  providedIn: 'root',
})

@Component({
  selector: 'app-compras',
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.css']
})

export class ComprasComponent {

  constructor(private router: Router, private http: HttpClient, public tokenService: TokenService, public dialogo: MatDialog,
    public localStorageService: LocalStorageService, private changeDetector: ChangeDetectorRef, public utilsService: UtilsService) { }


  columnas: string[] = ['No', 'descripcion', 'referencia', 'marca', 'cantidad', 'valorUnitario', 'descuento', 'subtotal', 'impuesto', 'total', 'precioVenta', 'precioMayoreo', 'precioInterno', 'isEdit'];

  openedMenu!: boolean;
  openedArticle!: boolean;
  openedProvider!: boolean;
  dataSourceCompras: any = [];
  dataSourceProveedores: any = [];
  dataSourceubicaciones: any = [];
  dataSourceCargarArticulos: any = [];
  dataSourcePurchase: any;
  dataSourcePurchaseArticulo: any = [];
  isLoadingResults: boolean = false;
  //Pagination
  pageEvent!: PageEvent;
  pageIndex: number = 0;
  pageSize !: number;
  length!: number;
  pageSizeOptions = [20];
  //Storage
  localStorageToken !: any;
  localStorageUser !: any;
  subscriber!: Subscription;
  //IvaIncluido Valor Unitario
  ivaIncluido: boolean = false;
  //Datos para operaciones

  operaciones: any = {
    cantidadArticulos: 0,
    subtotalCompra: 0,
    subtotalCompraArray: [],
    impuestoCompra: 0,
    impuestoCompraArray: [],
    descuentoCompra: 0,
    descuentoCompraArray: [],
    totalCompra: 0,
    totalCompraArray: [],
  }
  /**
   * Control Error Textfields Articles
   */
  codigoBarrasFormControl = new FormControl('', [Validators.required]);
  descripcionFormControl = new FormControl('', [Validators.required]);
  marcaFormControl = new FormControl('', [Validators.required]);
  referenciaFormControl = new FormControl('', [Validators.required]);
  unidadMedidaFormControl = new FormControl('', [Validators.required]);
  codigoUbicacionFormControl = new FormControl('', [Validators.required]);
  nuevoArticulo = {
    codigoBarras: '',
    descripcion: '',
    unidadMedida: '',
    codigoUbicacion: '',
    marca: '',
    referencia: ''
  };

  /**
   * Control Error Textfields Providers
   */
  tipoDocumentoFormControl = new FormControl('', [Validators.required]);
  numeroDocumentoFormControl = new FormControl('', [Validators.required]);
  nombreRazonSocialFormControl = new FormControl('', [Validators.required]);

  nuevoProveedor: any = {
    tipoDocumento: '',
    numeroDocumento: '',
    nombreRazonSocial: ''
  };

  /**
* Control Error Textfields Compras
*/
  numeroFacturaFormControl = new FormControl('', [Validators.required]);
  fechaFacturaFormControl = new FormControl('', [Validators.required]);
  fechaVencimientoFormControl = new FormControl('', [Validators.required]);
  subtotalFormControl = new FormControl('', [Validators.required]);
  impuestoFormControl = new FormControl('', [Validators.required]);
  totalFormControl = new FormControl('', [Validators.required]);

  nuevaCompra: any = {
    numeroFactura: '',
    fechaFactura: '',
    subtotal: '',
    descuento: '',
    impuesto: '',
    total: '',
    observaciones: '',
  };

  nuevoPrecio: any = {
    precioVenta: 0,
    precioMayoreo: 0,
    precioInterno: 0,
    impuestoUnitario: 0,
    valorUnitario: 0,
    subtotalUnitario: 0,
    total: 0,
    cantidad: 0,
    descuentoUnitario: 0,
  }

  reset: any = {
    cantidad: 0,
  }

  matcher = new MyErrorStateMatcher();
  mensajeExitosoArticulo: string = '';
  mensajeFallidoArticulo: string = '';
  mensajeExitoso: string = '';
  mensajeFallido: string = '';

  ngOnInit() {
    this.subscriber = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => { });
    this.localStorageUser = this.localStorageService.getItem('user_key');
    this.localStorageService.clear();
    if (this.localStorageUser) {
      this.localStorageService.setItem('user_key', this.localStorageUser);
    } else {
      this.routerLinkLogin();
    }
  }

  ngOnDestroy() {
    this.subscriber?.unsubscribe();
  }

  ngAfterContentChecked() {
    this.changeDetector.detectChanges();
  }

  async cargarUbicaciones() {
    this.mensajeFallidoArticulo = "";
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
            this.dataSourceubicaciones = response.Data.docs;
          }
          this.isLoadingResults = false;
        }, error => {
          this.isLoadingResults = false;
          if (error.status === 401) {
            this.routerLinkLogin();
          }
          console.error('Error en la solicitud:', error);
        });
    } catch (error) {
      this.isLoadingResults = false;
      this.mensajeFallidoArticulo = 'Error al consultar Ubicaciones. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

  async buscarProveedor() {
    this.mensajeFallido = "";
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`,
      })
    };

    let httpParams = new HttpParams();
    httpParams = httpParams.append('numeroDocumento', this.nuevoProveedor.numeroDocumento);
    this.isLoadingResults = true;
    try {
      this.http.get<any>(`https://p02--node-launet--m5lw8pzgzy2k.code.run/api/providers?${httpParams}`, httpOptions)
        .subscribe(response => {
          if (response.Status) {
            this.dataSourceProveedores = response.Data.docs.length > 0 ? response.Data.docs : null;
            this.nuevoProveedor.nombreRazonSocial = this.dataSourceProveedores !== null ? this.dataSourceProveedores[0].nombreRazonSocial : "NO EXISTE"
            this.nuevoProveedor.tipoDocumento = this.dataSourceProveedores !== null ? this.dataSourceProveedores[0].tipoDocumento : "NO EXISTE"
            this.nuevoProveedor.numeroDocumento = this.dataSourceProveedores !== null ? this.dataSourceProveedores[0].numeroDocumento : null
          }
          this.isLoadingResults = false;
        }, error => {
          this.isLoadingResults = false;
          if (error.status === 401) {
            this.routerLinkLogin();
          }
          console.error('Error en la solicitud:', error);
        });
    } catch (error) {
      this.mensajeFallido = 'Error al consultar Proveedor. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

  async buscarcompras() {
    this.mensajeFallido = "";
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`,
      })
    };
    try {
      this.isLoadingResults = true;
      this.http.get<any>('https://p01--node-launet2--m5lw8pzgzy2k.code.run/api/detailArticle', httpOptions)
        .subscribe(response => {
          if (response.Status) {
            this.dataSourceCompras = new MatTableDataSource(response.Data.docs);
            this.pageSize = response.Data.docs.limit;
            this.pageIndex = response.Data.docs.page;
            this.length = response.Data.totalDocs;
          }
          this.isLoadingResults = false;
        }, error => {
          this.isLoadingResults = false;
          if (error.status === 401) {
            this.routerLinkLogin();
          }
          console.error('Error en la solicitud:', error);
        });
    } catch (error) {
      this.mensajeFallido = 'Error al consultar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

  async crearArticulo() {
    const url = 'https://p02--node-launet--m5lw8pzgzy2k.code.run/api/articles';
    const body = {
      codigoBarras: this.nuevoArticulo.codigoBarras,
      descripcion: this.nuevoArticulo.descripcion,
      unidadMedida: this.nuevoArticulo.unidadMedida,
      codigoUbicacion: this.nuevoArticulo.codigoUbicacion,
      referencia: this.nuevoArticulo.referencia,
      marca: this.nuevoArticulo.marca
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
      this.isLoadingResults = false;
      this.mensajeExitosoArticulo = "Artículo guardado correctamente.";
      setTimeout(() => {
        this.openedArticle = false;
        this.setArticulo();
      }, 100);
    } catch (error) {
      this.isLoadingResults = false;
      this.mensajeFallidoArticulo = 'Error al guardar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

  async guardarCompra() {
    this.mensajeFallido = "";
    //Crear DataSource Purchase Articles
    for (let i = 0; i < this.dataSourceCargarArticulos.length; i++) {
      this.dataSourcePurchaseArticulo = [...this.dataSourcePurchaseArticulo,
      {
        "codigo": this.dataSourceCargarArticulos[i].codigo,
        "codigoBarras": this.dataSourceCargarArticulos[i].codigoBarras,
        "valorUnitario": this.dataSourceCargarArticulos[i].precios[0].valorUnitario,
        "impuestoUnitario": this.dataSourceCargarArticulos[i].precios[0].impuestoUnitario,
        "subtotalUnitario": this.dataSourceCargarArticulos[i].precios[0].subtotalUnitario,
        "cantidad": this.dataSourceCargarArticulos[i].precios[0].cantidad,
        "descuentoUnitario": this.dataSourceCargarArticulos[i].precios[0].descuentoUnitario,
        "total": this.dataSourceCargarArticulos[i].precios[0].total,
        "precioVenta": this.dataSourceCargarArticulos[i].precios[0].precioVenta,
        "precioMayoreo": this.dataSourceCargarArticulos[i].precios[0].precioMayoreo,
        "precioInterno": this.dataSourceCargarArticulos[i].precios[0].precioInterno
      },
      ]
    }
    //Crear DataSource Purchase
    this.dataSourcePurchase =
    {
      "numeroFactura": this.nuevaCompra.numeroFactura,
      "fechaFactura": this.nuevaCompra.fechaFactura,
      "subtotal": this.operaciones.subtotalCompra,
      "impuesto": this.operaciones.impuestoCompra,
      "descuento": this.operaciones.descuentoCompra,
      "total": this.operaciones.totalCompra,
      "proveedor": {
        "nombreRazonSocial": this.nuevoProveedor.nombreRazonSocial,
        "tipoDocumento": this.nuevoProveedor.tipoDocumento,
        "numeroDocumento": this.nuevoProveedor.numeroDocumento
      },
      "articulo": this.dataSourcePurchaseArticulo
    }
    const url = 'https://p01--node-launet2--m5lw8pzgzy2k.code.run/api/purchases';
    //const url = 'http://localhost:3030/api/purchases';
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`
      })
    };
    this.isLoadingResults = true;
    try {
      const response = await this.http.post(url, this.dataSourcePurchase, httpOptions).toPromise();
      this.isLoadingResults = false;
      this.mensajeExitoso = "Compra guardada correctamente.";
      setTimeout(() => {
        this.refreshPage();
      }, 100);
    } catch (error) {
      this.isLoadingResults = false;
      this.mensajeFallido = 'Error al guardar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

  setArticulo() {
    this.nuevoArticulo.codigoBarras = '';
    this.codigoBarrasFormControl.reset();
    this.nuevoArticulo.descripcion = '';
    this.descripcionFormControl.reset();
    this.nuevoArticulo.marca = '';
    this.marcaFormControl.reset();
    this.nuevoArticulo.referencia = '';
    this.referenciaFormControl.reset();
    this.nuevoArticulo.unidadMedida = '';
    this.unidadMedidaFormControl.reset();
    this.nuevoArticulo.codigoUbicacion = '';
    this.codigoUbicacionFormControl.reset();
    this.mensajeExitosoArticulo = '';
    this.mensajeFallidoArticulo = '';
  };

  setOperaciones() {
    this.operaciones.cantidadArticulos = 0,
      this.operaciones.subtotalCompra = 0,
      this.operaciones.subtotalCompraArray = [],
      this.operaciones.impuestoCompra = 0,
      this.operaciones.impuestoCompraArray = [],
      this.operaciones.descuentoCompra = 0,
      this.operaciones.descuentoCompraArray = [],
      this.operaciones.totalCompra = 0,
      this.operaciones.totalCompraArray = []
  };

  mostrarDialogo(message: string, process: number, element: any, i: number): void {
    this.dialogo
      .open(DialogoConfirmacionComponent, {
        data: message
      })
      .afterClosed()
      .subscribe((confirmar: Boolean) => {
        if (confirmar) {
          if (process === 1) {
            this.routerLinkProveedor();
          }
          if (process === 2) {
            this.refreshPage();
          }
          if (process === 3) {
            this.borrarArticuloStorage(element, i);
          }
        } else { }
      });
  }

  mostrarArticuloDialogo(): void {
    this.dialogo
      .open(DialogoArticuloComponent, {
        //data: message
      })
      .afterClosed()
      .subscribe((element: any = []) => {
        try {
          if (element.length !== 0) {
            this.cargarArticuloStorage(element)
          } else {
            //alert("No hacer nada");
          }
        } catch (error) {
          //alert("No hacer nada");
        }

      });
  }

  routerLinkProveedor(): void {
    this.router.navigate(['/registrarProveedor'])
  };

  routerLinkLogin(): void {
    this.router.navigate(['/login'])
    this.localStorageService.clear();
  };

  filtrarProveedor(event: Event) {
    const filtro = (event as Target as HTMLInputElement).value;
    return this.dataSourceProveedores.filter = filtro.trim().toLowerCase().includes;
  }

  cargarArticuloStorage(element: any) {
    element.precios = element.precios.length === 0 ? [...this.cargarPrecio(element.precios)] : element.precios;
    this.localStorageService.setItem(element._id, JSON.stringify(element));
    this.dataSourceCargarArticulos = [...this.dataSourceCargarArticulos, JSON.parse(this.localStorageService.getItem(element._id)!)];

    let i = this.dataSourceCargarArticulos.length - 1;

    this.dataSourceCargarArticulos[i].precios[0].subtotalUnitario = this.utilsService.calcularSubtotal(this.dataSourceCargarArticulos[i].precios[0].valorUnitario, this.dataSourceCargarArticulos[i].precios[0].cantidad, this.dataSourceCargarArticulos[i].precios[0].descuentoUnitario);
    this.dataSourceCargarArticulos[i].precios[0].total = this.utilsService.calculartotal(this.utilsService.calcularSubtotal(this.dataSourceCargarArticulos[i].precios[0].valorUnitario, this.dataSourceCargarArticulos[i].precios[0].cantidad, this.dataSourceCargarArticulos[i].precios[0].descuentoUnitario), this.dataSourceCargarArticulos[i].precios[0].impuestoUnitario);
    this.dataSourceCargarArticulos[i].precios[0].precioInterno = this.utilsService.calcularInterno(this.dataSourceCargarArticulos[i].precios[0].valorUnitario, this.dataSourceCargarArticulos[i].precios[0].impuestoUnitario);


    this.localStorageService.removeItem(this.dataSourceCargarArticulos[i]._id);
    this.localStorageService.setItem(this.dataSourceCargarArticulos[i]._id, JSON.stringify(this.dataSourceCargarArticulos[i]));

    this.dataSourceCargarArticulos.splice(i, 1, JSON.parse(this.localStorageService.getItem(this.dataSourceCargarArticulos[i]._id)!));
    this.dataSourceCargarArticulos = [...this.dataSourceCargarArticulos];

    this.operaciones.cantidadArticulos = this.dataSourceCargarArticulos.length;

    this.operaciones.subtotalCompraArray = [...this.operaciones.subtotalCompraArray, this.utilsService.numeros(this.dataSourceCargarArticulos[i].precios[0].subtotalUnitario)];
    this.operaciones.subtotalCompra = this.operaciones.subtotalCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);

    this.operaciones.impuestoCompraArray = [...this.operaciones.impuestoCompraArray, this.utilsService.calcularImpuesto(this.dataSourceCargarArticulos[i].precios[0].valorUnitario, this.dataSourceCargarArticulos[i].precios[0].cantidad, this.dataSourceCargarArticulos[i].precios[0].descuentoUnitario, this.dataSourceCargarArticulos[i].precios[0].impuestoUnitario)];
    this.operaciones.impuestoCompra = this.operaciones.impuestoCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);

    this.operaciones.descuentoCompraArray = [...this.operaciones.descuentoCompraArray, this.utilsService.calcularDescuento(this.dataSourceCargarArticulos[i].precios[0].valorUnitario, this.dataSourceCargarArticulos[i].precios[0].cantidad, this.dataSourceCargarArticulos[i].precios[0].descuentoUnitario)];
    this.operaciones.descuentoCompra = this.operaciones.descuentoCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);

    this.operaciones.totalCompraArray = [...this.operaciones.totalCompraArray, this.utilsService.numeros(this.dataSourceCargarArticulos[i].precios[0].total)];
    this.operaciones.totalCompra = this.operaciones.totalCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);
  }

  borrarArticuloStorage(element: any, i: number) {
    this.localStorageService.removeItem(element._id);
    this.dataSourceCargarArticulos.splice(i, 1);
    this.dataSourceCargarArticulos = [...this.dataSourceCargarArticulos];
    this.operaciones.cantidadArticulos = this.dataSourceCargarArticulos.length

    if (this.operaciones.cantidadArticulos > 0) {
      this.operaciones.subtotalCompraArray.splice(i, 1);
      this.operaciones.subtotalCompraArray = [...this.operaciones.subtotalCompraArray];
      this.operaciones.subtotalCompra = this.operaciones.subtotalCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);

      this.operaciones.impuestoCompraArray.splice(i, 1);
      this.operaciones.impuestoCompraArray = [...this.operaciones.impuestoCompraArray];
      this.operaciones.impuestoCompra = this.operaciones.impuestoCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);

      this.operaciones.descuentoCompraArray.splice(i, 1);
      this.operaciones.descuentoCompraArray = [...this.operaciones.descuentoCompraArray];
      this.operaciones.descuentoCompra = this.operaciones.descuentoCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);

      this.operaciones.totalCompraArray.splice(i, 1);
      this.operaciones.totalCompraArray = [...this.operaciones.totalCompraArray];
      this.operaciones.totalCompra = this.operaciones.totalCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);
    } else {
      this.setOperaciones();
    }
  }

  editandoArticuloStorage(element: any, i: number) {
    element.isEdit = true;
  }

  salvarEdicionArticuloStorage(element: any, i: number) {
    element.isEdit = false;
    this.localStorageService.removeItem(element._id);
    this.localStorageService.setItem(element._id, JSON.stringify(element));
    this.dataSourceCargarArticulos.splice(i, 1, JSON.parse(this.localStorageService.getItem(element._id)!));
    this.dataSourceCargarArticulos = [...this.dataSourceCargarArticulos];

    this.dataSourceCargarArticulos[i].precios[0].subtotalUnitario = this.utilsService.calcularSubtotal(this.dataSourceCargarArticulos[i].precios[0].valorUnitario, this.dataSourceCargarArticulos[i].precios[0].cantidad, this.dataSourceCargarArticulos[i].precios[0].descuentoUnitario);
    this.dataSourceCargarArticulos[i].precios[0].total = this.utilsService.calculartotal(this.utilsService.calcularSubtotal(this.dataSourceCargarArticulos[i].precios[0].valorUnitario, this.dataSourceCargarArticulos[i].precios[0].cantidad, this.dataSourceCargarArticulos[i].precios[0].descuentoUnitario), this.dataSourceCargarArticulos[i].precios[0].impuestoUnitario);

    this.localStorageService.removeItem(this.dataSourceCargarArticulos[i]._id);
    this.localStorageService.setItem(this.dataSourceCargarArticulos[i]._id, JSON.stringify(this.dataSourceCargarArticulos[i]));

    this.operaciones.subtotalCompraArray.splice(i, 1, this.utilsService.numeros(this.dataSourceCargarArticulos[i].precios[0].subtotalUnitario));
    this.operaciones.subtotalCompraArray = [...this.operaciones.subtotalCompraArray];
    this.operaciones.subtotalCompra = this.operaciones.subtotalCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);

    this.operaciones.impuestoCompraArray.splice(i, 1, this.utilsService.calcularImpuesto(this.dataSourceCargarArticulos[i].precios[0].valorUnitario, this.dataSourceCargarArticulos[i].precios[0].cantidad, this.dataSourceCargarArticulos[i].precios[0].descuentoUnitario, this.dataSourceCargarArticulos[i].precios[0].impuestoUnitario));
    this.operaciones.impuestoCompraArray = [...this.operaciones.impuestoCompraArray];
    this.operaciones.impuestoCompra = this.operaciones.impuestoCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);

    this.operaciones.descuentoCompraArray.splice(i, 1, this.utilsService.calcularDescuento(this.dataSourceCargarArticulos[i].precios[0].valorUnitario, this.dataSourceCargarArticulos[i].precios[0].cantidad, this.dataSourceCargarArticulos[i].precios[0].descuentoUnitario));
    this.operaciones.descuentoCompraArray = [...this.operaciones.descuentoCompraArray];
    this.operaciones.descuentoCompra = this.operaciones.descuentoCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);

    this.operaciones.totalCompraArray.splice(i, 1, this.utilsService.numeros(this.dataSourceCargarArticulos[i].precios[0].total));
    this.operaciones.totalCompraArray = [...this.operaciones.totalCompraArray];
    this.operaciones.totalCompra = this.operaciones.totalCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);

  }

  cancelarCambios(element: any, i: number) {
    element.isEdit = false;
    this.dataSourceCargarArticulos.splice(i, 1, JSON.parse(this.localStorageService.getItem(element._id)!));
    this.dataSourceCargarArticulos = [...this.dataSourceCargarArticulos];
  }

  cargarPrecio(element: any) {
    element = [
      this.nuevoPrecio
    ]
    return element;
  }

  subtotal(element: any, index: number) {
    this.dataSourceCargarArticulos[index].precios[0].subtotalUnitario = this.utilsService.calcularSubtotal(element[0].valorUnitario, element[0].cantidad, element[0].descuentoUnitario)
  }

  interno(element: any, index: number) {
    this.dataSourceCargarArticulos[index].precios[0].precioInterno = this.utilsService.calcularInterno(element[0].valorUnitario,element[0].impuestoUnitario)
  }

  total(element: any, index: number) {
    this.dataSourceCargarArticulos[index].precios[0].total = this.utilsService.calculartotal(this.utilsService.calcularSubtotal(element[0].valorUnitario, element[0].cantidad, element[0].descuentoUnitario), element[0].impuestoUnitario)
  }

  unitarioIvaIncluido(element: any, index: number) {
    this.ivaIncluido = element[0].impuestoUnitario === "019" ? true : false;
    if (this.ivaIncluido) {
      this.dataSourceCargarArticulos[index].precios[0].valorUnitario = this.utilsService.calcularUnitario(element[0].valorUnitario, parseInt(element[0].impuestoUnitario));
      this.dataSourceCargarArticulos[index].precios[0].subtotalUnitario = this.utilsService.calcularUnitario(element[0].subtotalUnitario, parseInt(element[0].impuestoUnitario));
    }
  }

  refreshPage() {
    window.location.reload();
  }

}

export class compras {
  constructor(public No: String, public descripcion: String, public marca: string, public referencia: string,
    public valorUnitario: string, public descuento: string, public impuesto: string, public subtotal: string, public cantidad: string,
    public precioVenta: string, public precioMayoreo: string, public precioInterno: string, public total: string, public isEdit: boolean
  ) { }
}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }

}
