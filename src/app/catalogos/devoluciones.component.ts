import { ChangeDetectorRef, Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TokenService } from '../login/token';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { DialogoConfirmacionComponent } from "../dialogo.confirmacion/dialogo.component";

import { MatSort } from '@angular/material/sort';
import { NavigationEnd, Router } from '@angular/router';
import { LocalStorageService } from '../local-storage.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { filter } from 'rxjs';
import { UtilsService } from '../utils.service';
import { PrinterUtilsService } from '../printerUtils.service';
import { CurrencyPipe } from '@angular/common';

/** Setear fechas */
const month = new Date().getMonth();
const year = new Date().getFullYear();
const day = new Date().getDate();

@Component({
  selector: 'app-devoluciones',
  templateUrl: './devoluciones.component.html',
  styleUrls: ['./catalogos.component.css']
})
export class DevolucionesComponent implements AfterViewInit, OnInit {

  constructor(private router: Router, private http: HttpClient, public tokenService: TokenService, public dialogo: MatDialog,
    public localStorageService: LocalStorageService, private changeDetector: ChangeDetectorRef, public utilsService: UtilsService,
    public elementRef: ElementRef, private currencyPipe: CurrencyPipe, public printerUtilsService: PrinterUtilsService) { }

  columnas: string[] = ['numeroFactura', 'fechaFactura', 'efectivo', 'transferencia', 'total', 'vendedor', 'facturaElectronica', 'numeroDevolucion', 'accion'];
  columnasCarItem: string[] = ['descripcion', 'cantidad', 'precio', 'total', 'isEdit'];

  //Habuilitadores + DataSources
  openedMenu!: boolean;
  openedCustomer!: boolean;
  dataSourceCatalogo: any = [];
  dataSourceClientes: any = [];
  dataSourceCarItem: any = [];
  dataSourceSales: any = [];
  dataSourceSalesArticle: any = [];
  dataSourceCajas: any = [];
  isLoadingResults: boolean = false;
  devolucion: boolean = false
  //Pagination
  pageEvent!: PageEvent;
  pageIndex: number = 0;
  pageSize !: number;
  length!: number;
  pageSizeOptions = [20];
  //Storage
  localStorageToken !: any;
  localStorageUser !: any;
  localStorageCashier !: any;
  subscriber!: Subscription;
  //Calculos
  startDate!: any;
  endDate!: any;
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
    totalArticulos: 0,
    totalArticulosArray: [],
    subtotalCompraMayoreo: 0,
    subtotalCompraMayoreoArray: [],

  }

  /**
 * Control Error Textfields Customers
 */
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  tipoDocumentoFormControl = new FormControl('', [Validators.required]);
  numeroDocumentoFormControl = new FormControl('', [Validators.required]);
  nombreRazonSocialFormControl = new FormControl('', [Validators.required]);
  tipoClienteFormControl = new FormControl('', [Validators.required]);
  consultaNumeroDocumentoFormControl = new FormControl('', [Validators.required]);
  /**
 * Control Error Textfields Consultar Customers
 */
  consultaCliente: any = {
    tipoDocumento: '',
    numeroDocumento: '',
    nombreRazonSocial: '',
    email: '',
    tipoCliente: ''
  };


  /**
* Control Error Textfields Consultas
*/

  buscarVentaFormControl = new FormControl('');
  nuevaBusqueda: any = {
    buscarVenta: ''
  };

  matcher = new MyErrorStateMatcher();
  mensajeExitoso: string = '';
  mensajeFallido: string = '';
  mensajeExitosoCliente: string = '';
  mensajeFallidoCliente: string = '';



  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild("inputCode") InputField: any = ElementRef;



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
    this.buscarCajaAbierta();
  }

  ngAfterContentChecked() {
    this.changeDetector.detectChanges();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.InputField.nativeElement.focus();
    }, 500);
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

    let httpParams = new HttpParams();
    if (this.nuevaBusqueda.buscarVenta == "") {
      this.mensajeFallido = 'Ingrese Numero de Factura'
      return;
    }
    httpParams = httpParams.append('numeroFactura', this.nuevaBusqueda.buscarVenta);
    this.isLoadingResults = true;
    try {
      this.http.get<any>(`https://p01--node-launet2--m5lw8pzgzy2k.code.run/api/sales?${httpParams}`, httpOptions)
      //this.http.get<any>(`http://localhost:3030/api/sales?${httpParams}`, httpOptions)
        .subscribe(response => {
          if (response.Status) {
            if (response.Data.totalDocs === 0) {
              this.mensajeFallido = `Factura ${this.nuevaBusqueda.buscarVenta}, no encontrada`;

            }else{
              this.dataSourceCatalogo = new MatTableDataSource(response.Data.docs);
              this.devolucion = response.Data.docs[0].numeroDevolucion === null || response.Data.docs[0].numeroDevolucion === "" || !response.Data.docs[0].numeroDevolucion ? false : true
            }
          }
          this.isLoadingResults = false;
        }, error => {
          this.isLoadingResults = false;
          if (error.status === 401) {
            this.routerLinkLogin();
          }
          if (error.status === 404) {
            this.mensajeFallido = 'Factura no encontrada';
          }
          console.error('Error en la solicitud:', error);
        });
    } catch (error) {
      this.mensajeFallido = 'Error al consultar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
    this.InputField.nativeElement.focus();
  }

  cargarFactura(element: any): void {
    try {
      this.setOperaciones();
      if (element.length !== 0) {
        for (let i = 0; i < element.articulo.length; i++) {

          this.buscarCatalogoDevolucion(element.articulo[i]);
        }
        this.consultaCliente.nombreRazonSocial = element.cliente.nombreRazonSocial;
        this.consultaCliente.tipoDocumento = element.cliente.tipoDocumento;
        this.consultaCliente.numeroDocumento = element.cliente.numeroDocumento;
        this.consultaCliente.email = element.cliente.email;
        this.consultaCliente.tipoCliente = element.cliente.tipoCliente;
      } else {
        //alert("No hacer nada");
      }
    } catch (error) {
      //alert("No hacer nada");
    }
  };

  async buscarCatalogoDevolucion(element: any) {
    this.mensajeFallido = "";
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`,
      })
    };

    let httpParams = new HttpParams();
    httpParams = httpParams.append('codigo', element.codigo);
    this.isLoadingResults = true;
    try {
      this.http.get<any>(`https://p01--node-launet2--m5lw8pzgzy2k.code.run/api/detailArticle?${httpParams}`, httpOptions)
        .subscribe(response => {
          if (response.Status) {
            if (response.Data.totalDocs === 0) {
              this.mensajeFallido = `Articulo ${element.descripcion}, no encontrado`;
            } else {
              if (response.Data.docs.length === 1) {
                this.addToCartFactura(response.Data.docs[0], element)
              }
            }
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

  addToCartFactura(inventario: any = [], element: any = []) {
    try {
      element =
      {
        "_id": element._id,
        "stock": this.utilsService.numeros(inventario.inventarios[0].stock),
        "detalleArticulo": [
          {
            "codigo": element.codigo,
            "codigoBarras": element.codigoBarras,
            "descripcion": element.descripcion,
            "cantidad": this.utilsService.numeros(element.cantidad),
            "valorUnitario": this.utilsService.numeros(element.valorUnitario) > 0 ? element.valorUnitario : this.utilsService.numeros(inventario.precios[0].valorUnitario) > 0?inventario.precios[0].valorUnitario: 0,
            "precioVenta": this.utilsService.numeros(element.precioVenta),
            "precioMayoreo": this.utilsService.numeros(element.precioMayoreo) > 0 ? element.precioMayoreo : this.utilsService.numeros(inventario.precios[0].precioMayoreo) > 0? inventario.precios[0].precioMayoreo: 0,
            "precioInterno": this.utilsService.numeros(element.precioInterno) > 0 ? element.precioInterno : this.utilsService.numeros(inventario.precios[0].precioInterno) > 0? inventario.precios[0].precioInterno: 0,
            "descuento": this.utilsService.numeros(element.descuento),
            "subtotal": this.utilsService.multiplicarNumero(this.utilsService.numeros(element.precioVenta), element.cantidad),
            "impuesto": this.utilsService.numeros(element.impuesto) > 0 ? this.utilsService.numeros(element.impuesto) : 0,
            "total": this.utilsService.multiplicarNumero(this.utilsService.numeros(element.precioVenta), element.cantidad) - this.utilsService.numeros(element.descuento),
            "mayoreo": element.mayoreo,
            "interno": element.interno,
          }
        ]
      }

      this.localStorageService.setItem(element._id, JSON.stringify(element));
      this.dataSourceCarItem = [...this.dataSourceCarItem, JSON.parse(this.localStorageService.getItem(element._id)!)]
      this.operaciones.cantidadArticulos = this.dataSourceCarItem.length

      this.operaciones.totalArticulosArray = [...this.operaciones.totalArticulosArray, (parseInt(this.dataSourceCarItem[this.operaciones.cantidadArticulos - 1].detalleArticulo[0].cantidad))]
      this.operaciones.totalArticulos = this.operaciones.totalArticulosArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);

      this.operaciones.subtotalCompraArray = [...this.operaciones.subtotalCompraArray, this.utilsService.multiplicarNumero(this.dataSourceCarItem[this.operaciones.cantidadArticulos - 1].detalleArticulo[0].precioVenta, this.dataSourceCarItem[this.operaciones.cantidadArticulos - 1].detalleArticulo[0].cantidad)]
      this.operaciones.subtotalCompra = this.operaciones.subtotalCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);

      this.operaciones.descuentoCompraArray = [...this.operaciones.descuentoCompraArray, this.dataSourceCarItem[this.operaciones.cantidadArticulos - 1].detalleArticulo[0].descuento]
      this.operaciones.descuentoCompra = this.operaciones.descuentoCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);
    } catch (error) {
      this.isLoadingResults = false;
      this.mensajeFallidoCliente = 'Error al cargar el producto. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }

  }

  mostrarDialogo(message: string): void {
    this.dialogo
      .open(DialogoConfirmacionComponent, {
        data: message
      })
      .afterClosed()
      .subscribe((confirmar: Boolean) => {
        if (confirmar) {
          this.refreshPage();
        } else {
          //alert("No hacer nada");
        }
      });
  }

  routerLinkLogin(): void {
    this.router.navigate(['/login'])
    this.localStorageService.clear();
  };

  refreshPage() {
    window.location.reload();
  }

  setOperaciones() {
    this.dataSourceCarItem = [],
      this.operaciones.cantidadArticulos = 0,
      this.operaciones.subtotalCompra = 0,
      this.operaciones.subtotalCompraArray = [],
      this.operaciones.impuestoCompra = 0,
      this.operaciones.impuestoCompraArray = [],
      this.operaciones.descuentoCompra = 0,
      this.operaciones.descuentoCompraArray = [],
      this.operaciones.totalCompra = 0,
      this.operaciones.totalCompraArray = [],
      this.operaciones.totalArticulos = 0,
      this.operaciones.totalArticulosArray = []
  };

  async buscarCajaAbierta() {
    this.startDate = new Date(year, month, day);
    this.endDate = new Date(year, month, day + 1);
    const token = this.tokenService.token;
    //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2M3YzI2ZDI5NDRiMmM2MWFiZWQ5NCIsImlhdCI6MTcxMTc1MTk5NywiZXhwIjoxNzExODM4Mzk3fQ.ofi_91n-PGP50bUAoXUWga26suD97WX9W9Uyy24u3Vc"
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`,
      })
    };
    this.isLoadingResults = true;
    try {
      let httpParams = new HttpParams();
      httpParams = httpParams.append('startDate', this.startDate);
      httpParams = httpParams.append('endDate', this.endDate);
      this.http.get<any>(`https://p01--node-launet2--m5lw8pzgzy2k.code.run/api/cashierMovements?${httpParams}`, httpOptions)
        //this.http.get<any>(`http://localhost:3030/api/cashierMovements?${httpParams}`, httpOptions)
        .subscribe(response => {
          if (response.Status) {
            this.dataSourceCajas = response.Data.filter(((arr: { estadoActivo: any; }) => arr.estadoActivo === true))
          }
          this.isLoadingResults = false;
          switch (this.dataSourceCajas.length) {
            case 0:
              alert("No Existe Caja Abierta")
              this.routerLinkLogin();
              return;
            case 1:
              this.localStorageService.setItem('cashier', this.dataSourceCajas[0].idCaja);
              this.localStorageCashier = this.dataSourceCajas[0].idCaja;
              return;
            default:
              alert("Seleccione Caja")
              return;
          }
        }, error => {
          this.isLoadingResults = false;
          if (error.status === 401) {
            this.routerLinkLogin();
          }
          if (error.status === 404) {
            alert("No Existe Caja Abierta")
            this.routerLinkLogin();
            return;
          }
          console.error('Error en la solicitud:', error);
        });
    } catch (error) {
      this.isLoadingResults = false;
      this.mensajeFallido = 'Error al consultar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

  async realizarDevolucion() {
    //Cargamos el Json Principal sin detalle Articulos
    
    if (!this.localStorageCashier) {
      this.localStorageCashier = this.localStorageService.getItem('cashier');  
    }
    //Cargamos el Json Principal con detalle Articulos
    this.dataSourceSalesArticle = [];
    for (let i = 0; i < this.dataSourceCarItem.length; i++) {
      this.dataSourceSalesArticle = [...this.dataSourceSalesArticle, this.dataSourceCarItem[i].detalleArticulo[0]]
    }
    this.dataSourceSales =
    {
      "numeroDevolucion": new Date().getTime(),
      "numeroFactura": this.dataSourceCatalogo.filteredData[0].numeroFactura,
      "numeroFacturaElectronica": this.dataSourceCatalogo.filteredData[0].numeroFacturaElectronica,
      "fechaDevolucion": this.utilsService.getDate(null),
      "fechaFactura": this.dataSourceCatalogo.filteredData[0].fechaFactura,
      "subtotal": this.operaciones.subtotalCompra,
      "impuesto": this.operaciones.impuestoCompra,
      "descuento": this.operaciones.descuentoCompra,
      "total": this.operaciones.subtotalCompra - this.operaciones.descuentoCompra,
      "usuario": this.tokenService.userName,
      "fechaConsultas": new Date(),
      "cliente": {
        "nombreRazonSocial": this.consultaCliente.nombreRazonSocial,
        "tipoDocumento": this.consultaCliente.tipoDocumento,
        "numeroDocumento": this.consultaCliente.numeroDocumento,
        "email": this.consultaCliente.email,
        "tipoCliente": this.consultaCliente.tipoCliente
      },
      "articulo": this.dataSourceSalesArticle,
      "formaDePago": this.dataSourceCatalogo.filteredData[0].formaDePago,
      "cantidadEfectivo": this.dataSourceCatalogo.filteredData[0].cantidadEfectivo,
      "cantidadTransferencia": this.dataSourceCatalogo.filteredData[0].cantidadTransferencia,
      "facturacionElectronica": this.dataSourceCatalogo.filteredData[0].facturacionElectronica,
      "vendedor": this.dataSourceCatalogo.filteredData[0].vendedor,
      "imprimirFactura": true,
      "devolucion": true,
      "idCaja": this.localStorageCashier,
    }
    const url = 'https://p01--node-launet2--m5lw8pzgzy2k.code.run/api/returns';
    //const url = 'http://localhost:3030/api/returns';
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`
      })
    };
    this.isLoadingResults = true;
    try {
      const response = await this.http.post(url, this.dataSourceSales, httpOptions).toPromise();
      this.mensajeExitoso = "Devolución guardada correctamente.";
      this.isLoadingResults = false;
      this.printerUtilsService.connectToPrinter(this.dataSourceSales.imprimirFactura, this.dataSourceSales);
      setTimeout(() => {
        this.refreshPage();
      }, 100);
    } catch (error) {
      this.isLoadingResults = false;
      console.log(this.dataSourceSales)
      this.mensajeFallido = 'Error al guardar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }

}