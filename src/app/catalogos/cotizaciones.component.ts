import { ChangeDetectorRef, Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TokenService } from '../login/token';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { DialogoConfirmacionComponent } from "../dialogo.confirmacion/dialogo.component";
import { DialogoCarItemComponent } from "../dialogo.carItem/dialogo.carItem.component";
import { DialogoCarItemVariableComponent } from "../dialogo.carItemVariable/dialogo.carItemVariable.component";
import { DialogoCarItemCentimetroComponent } from "../dialogo.carItemCentimetro/dialogo.carItemCentimetro.component";
import { DialogoCotizacionComponent } from '../dialogo.imprimirCotizacion/dialogo.cotizacion.component';
import { DialogoBuscarCotizacionComponent } from "../dialogo.buscarCotizacion/dialogo.buscarCotizacion.component";

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
  selector: 'app-cotizaciones',
  templateUrl: './cotizaciones.component.html',
  styleUrls: ['./catalogos.component.css']
})
export class CotizacionesComponent implements AfterViewInit, OnInit {

  constructor(private router: Router, private http: HttpClient, public tokenService: TokenService, public dialogo: MatDialog,
    public localStorageService: LocalStorageService, private changeDetector: ChangeDetectorRef, public utilsService: UtilsService,
    public elementRef: ElementRef, private currencyPipe: CurrencyPipe, public printerUtilsService: PrinterUtilsService) { }

  columnas: string[] = ['codigoBarras', 'descripcion', 'referencia', 'marca', 'ubicacion', 'unidadMedida', 'stock', 'precioventa', 'accion'];
  columnasCarItem: string[] = ['descripcion', 'cantidad', 'precio', 'total', 'isEdit'];

  //Habuilitadores + DataSources
  openedMenu!: boolean;
  openedCustomer!: boolean;
  dataSourceCatalogo: any = [];
  dataSourceClientes: any = [];
  dataSourceCarItem: any = [];
  dataSourceSales: any = [];
  dataSourceSalesArticle: any = [];
  isLoadingResults: boolean = false;
  inventarioCotizacion: boolean = true
  isServicio: string = 'SER';
  isCentimetro: string = 'CEN';
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
 * Control Error Textfields Customers
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
  consultaNumeroCotizacionFormControl = new FormControl('', [Validators.required]);
  consultaNumeroDocumentoFormControl = new FormControl('', [Validators.required]);

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
    barrio: ''
  };

  /**
 * Control Error Textfields Consultar Customers
 */
  consultaCliente: any = {
    tipoDocumento: '',
    numeroDocumento: '1111111111',
    nombreRazonSocial: '',
    email: '',
    tipoCliente: ''
  };


  /**
* Control Error Textfields Consultas
*/

  buscarDescripcionFormControl = new FormControl('');
  buscarCodigoBarrasFormControl = new FormControl('');
  nuevaBusqueda: any = {
    buscarDescripcion: '',
    buscarCodigoBarras: ''
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
    this.buscarCliente();
  }

  ngAfterContentChecked() {
    this.changeDetector.detectChanges();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.InputField.nativeElement.focus();
    }, 500);
  }

  async buscarCliente() {
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`,
      })
    };

    let httpParams = new HttpParams();
    httpParams = httpParams.append('numeroDocumento', this.consultaCliente.numeroDocumento);
    this.isLoadingResults = true;
    try {
      this.http.get<any>(`https://p02--node-launet--m5lw8pzgzy2k.code.run/api/customers?${httpParams}`, httpOptions)
        .subscribe(response => {
          if (response.Status) {
            this.dataSourceClientes = response.Data.docs.length > 0 ? response.Data.docs : null;
            this.consultaCliente.nombreRazonSocial = this.dataSourceClientes !== null ? this.dataSourceClientes[0].nombreRazonSocial : "NO EXISTE"
            this.consultaCliente.tipoDocumento = this.dataSourceClientes !== null ? this.dataSourceClientes[0].tipoDocumento : "NO EXISTE"
            this.consultaCliente.numeroDocumento = this.dataSourceClientes !== null ? this.dataSourceClientes[0].numeroDocumento : null
            this.consultaCliente.email = this.dataSourceClientes !== null ? this.dataSourceClientes[0].email : null
            this.consultaCliente.tipoCliente = this.dataSourceClientes !== null ? this.dataSourceClientes[0].tipoCliente : null
          }
          this.isLoadingResults = false;
          //this.enviarImpresion();
        }, error => {
          this.isLoadingResults = false;
          if (error.status === 401) {
            this.routerLinkLogin();
          }
          console.error('Error en la solicitud:', error);
        });
    } catch (error) {
      this.isLoadingResults = false;
      this.mensajeFallido = 'Error al consultar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

  async buscarCatalogo(process: number) {
    this.mensajeFallido = "";
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`,
      })
    };

    let httpParams = new HttpParams();
    httpParams = process === 0 ? httpParams.append('descripcion', this.nuevaBusqueda.buscarDescripcion) : httpParams.append('codigoBarras', this.nuevaBusqueda.buscarCodigoBarras);
    this.isLoadingResults = true;
    try {
      this.http.get<any>(`https://p01--node-launet2--m5lw8pzgzy2k.code.run/api/detailArticle?${httpParams}`, httpOptions)
        .subscribe(response => {
          if (response.Status) {
            if (response.Data.totalDocs === 0) {
              this.mensajeFallido = 'Articulo no encontrado';
            } else {
              if (response.Data.docs.length === 1) {
                this.addToCart(response.Data.docs[0])
              }
            }
            this.dataSourceCatalogo = new MatTableDataSource(response.Data.docs);
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
    if (process > 0) {
      this.nuevaBusqueda.buscarCodigoBarras = "";
    }
    this.InputField.nativeElement.focus();
  }

  filtrar(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    this.dataSourceCatalogo.filter = filtro.trim().toLowerCase();
    this.isLoadingResults = false;
  }

  mostrarDialogo(message: string, process: number, element: any, i: number): void {
    this.dialogo
      .open(DialogoConfirmacionComponent, {
        data: message
      })
      .afterClosed()
      .subscribe((confirmar: Boolean) => {
        if (confirmar) {
          if (process === 1) {
            this.routerLinkArticulo();
          }
          if (process === 2) {
            this.refreshPage();
          }
          if (process === 3) {
            this.borrarArticuloCarItem(element, i);
          }
        } else {
          //alert("No hacer nada");
        }
      });
  }

  mostrarArticuloCarItem(element: any = [], i: number): void {
    element.isEdit = true;
    if (element.detalleArticulo[0].unidadMedida === this.isServicio) {
      this.dialogo
        .open(DialogoCarItemVariableComponent, {
          data: element
        })
        .afterClosed()
        .subscribe((confirmar: boolean) => {
          try {
            if (confirmar) {
              element.isEdit = false;
              this.changeQty(element, i, 0, 'replace');
            } else {
              element.isEdit = false;
            }
          } catch (error) {
            //alert("No hacer nada");
          }
          element.isEdit = false;
        });
    } else if (element.detalleArticulo[0].unidadMedida === this.isCentimetro) {
      this.dialogo
        .open(DialogoCarItemCentimetroComponent, {
          data: element
        })
        .afterClosed()
        .subscribe((confirmar: boolean) => {
          try {
            if (confirmar) {
              element.isEdit = false;
              this.changeQty(element, i, 0, 'replace');
            } else {
              element.isEdit = false;
            }
          } catch (error) {
            //alert("No hacer nada");
          }
          element.isEdit = false;
        });
    } else {
      this.dialogo
        .open(DialogoCarItemComponent, {
          data: element
        })
        .afterClosed()
        .subscribe((confirmar: boolean) => {
          try {
            if (confirmar) {
              element.isEdit = false;
              this.changeQty(element, i, 0, 'replace');
            } else {
              element.isEdit = false;
            }
          } catch (error) {
            //alert("No hacer nada");
          }
          element.isEdit = false;
        });
    }
  }

  imprimirCotizacion(): void {
    //Cargamos el Json Principal con detalle Articulos
    this.dataSourceSalesArticle = [];
    for (let i = 0; i < this.dataSourceCarItem.length; i++) {
      this.dataSourceSalesArticle = [...this.dataSourceSalesArticle, this.dataSourceCarItem[i].detalleArticulo[0]]
    }
    this.dataSourceSales =
    {
      "numeroCotizacion": new Date().getTime(),
      "fechaCotizacion": this.utilsService.getDate(null),
      "fechaVencimiento": this.utilsService.getDate(new Date(year, month, day + 20)),
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
    }
    this.dialogo
      .open(DialogoCotizacionComponent, {
        data: this.dataSourceSales
      })
      .afterClosed()
      .subscribe((confirmar: boolean) => {
        try {
          if (confirmar) {
            this.guardarCotizacion();
          }
        } catch (error) {
          //alert("No hacer nada");
        }
      });
  }

  async guardarCotizacion() {
    const url = 'https://p02--node-launet--m5lw8pzgzy2k.code.run/api/quotations';
    //const url = 'http://localhost:3030/api/sales';
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
      this.mensajeExitoso = "Cotización guardada correctamente.";
      this.isLoadingResults = false;
      setTimeout(() => {
        this.refreshPage();
      }, 200);
    } catch (error) {
      this.isLoadingResults = false;
      this.mensajeFallido = 'Error al guardar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

  async guardarCliente() {
    this.mensajeFallidoCliente = "";
    const url = `https://p02--node-launet--m5lw8pzgzy2k.code.run/api/customers`
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`
      })
    };
    this.isLoadingResults = true;
    try {
      const response = await this.http.post(url, this.nuevoCliente, httpOptions).toPromise();
      this.isLoadingResults = false;
      this.mensajeExitosoCliente = "Cliente guardado exitosamente"
      setTimeout(() => {
        this.openedCustomer = false;
        this.setCliente();
      }, 100);
    } catch (error) {
      this.isLoadingResults = false;
      this.mensajeFallidoCliente = 'Error al guardar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

  async buscarCotizacion() {
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`,
      })
    };
    let httpParams = new HttpParams();
    httpParams = httpParams.append('numeroCotizacion', this.consultaCliente.numeroCotizacion);
    this.isLoadingResults = true;
    try {
      this.http.get<any>(`https://p02--node-launet--m5lw8pzgzy2k.code.run/api/quotations?${httpParams}`, httpOptions)
        .subscribe(response => {
          if (response.Status) {
            for (let i = 0; i < response.Data[0].articulo.length; i++) {
              this.buscarCatalogoCotizacion(response.Data[0].articulo[i]);
            }
            this.consultaCliente.nombreRazonSocial = response.Data[0].cliente.nombreRazonSocial;
            this.consultaCliente.tipoDocumento = response.Data[0].cliente.tipoDocumento;
            this.consultaCliente.numeroDocumento = response.Data[0].cliente.numeroDocumento;
            this.consultaCliente.email = response.Data[0].cliente.email;
            this.consultaCliente.tipoCliente = response.Data[0].cliente.tipoCliente;
          }
          this.isLoadingResults = false;
          this.mensajeFallido = "";
          this.consultaCliente.numeroCotizacion = "";
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
      this.isLoadingResults = false;
      this.mensajeFallido = 'Error al consultar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

  async buscarCatalogoCotizacion(element: any) {
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
                this.addToCartCotizacion(response.Data.docs[0], element)
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

  addToCartCotizacion(inventario: any = [], element: any = []) {
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
            "unidadMedida": element.unidadMedida,
            "cantidad": this.utilsService.numeros(element.cantidad),
            "precioVenta": this.utilsService.numeros(element.precioVenta),
            "precioMayoreo": this.utilsService.numeros(inventario.precios[0].precioMayoreo) > 0 ? inventario.precios[0].precioMayoreo : 0,
            "precioInterno": this.utilsService.numeros(inventario.precios[0].precioInterno) > 0 ? inventario.precios[0].precioInterno : 0,
            "descuento": this.utilsService.numeros(element.descuento),
            "subtotal": this.utilsService.multiplicarNumero(this.utilsService.numeros(element.precioVenta), element.cantidad),
            "impuesto": this.utilsService.numeros(element.impuesto),
            "total": this.utilsService.multiplicarNumero(this.utilsService.numeros(element.precioVenta), element.cantidad) - this.utilsService.numeros(element.descuento),
            "mayoreo": element.mayoreo,
            "interno": element.interno,
            "cotizacion": false,
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

      this.operaciones.descuentoCompraArray = [...this.operaciones.descuentoCompraArray, this.utilsService.numeros(this.dataSourceCarItem[this.operaciones.cantidadArticulos - 1].detalleArticulo[0].descuento)]
      this.operaciones.descuentoCompra = this.operaciones.descuentoCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);
    } catch (error) {
      this.isLoadingResults = false;
      this.mensajeFallidoCliente = 'Error al cargar el producto. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }

  }

  setCliente() {
    this.nuevoCliente.tipoDocumento = '';
    this.tipoDocumentoFormControl.reset();
    this.nuevoCliente.numeroDocumento = '';
    this.numeroDocumentoFormControl.reset();
    this.nuevoCliente.nombreRazonSocial = '';
    this.nombreRazonSocialFormControl.reset();
    this.nuevoCliente.telefono = '';
    this.telefonoFormControl.reset();
    this.nuevoCliente.direccion = '';
    this.direccionFormControl.reset();
    this.nuevoCliente.departamento = '';
    this.departamentoFormControl.reset();
    this.nuevoCliente.municipio = '';
    this.municipioFormControl.reset();
    this.nuevoCliente.email = '';
    this.emailFormControl.reset();
    this.nuevoCliente.tipoCliente = '';
    this.tipoClienteFormControl.reset();
    this.nuevoCliente.barrio.reload = '';
    this.barrioFormControl.reset();
    this.mensajeExitosoCliente = '';
    this.mensajeFallidoCliente = '';
  };

  routerLinkArticulo(): void {
    this.router.navigate(['/registrarArticulo'])
  };

  routerLinkLogin(): void {
    this.router.navigate(['/login'])
    this.localStorageService.clear();
  };

  refreshPage() {
    window.location.reload();
  }

  borrarArticuloCarItem(element: any = [], i: number) {
    this.localStorageService.removeItem(element._id);
    this.dataSourceCarItem.splice(i, 1);
    this.dataSourceCarItem = [...this.dataSourceCarItem];
    this.operaciones.cantidadArticulos = this.dataSourceCarItem.length

    if (this.operaciones.cantidadArticulos > 0) {
      this.operaciones.totalArticulosArray.splice(i, 1);
      this.operaciones.totalArticulosArray = [...this.operaciones.totalArticulosArray];
      this.operaciones.totalArticulos = this.operaciones.totalArticulosArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);
      this.operaciones.subtotalCompraArray.splice(i, 1);
      this.operaciones.subtotalCompraArray = [...this.operaciones.subtotalCompraArray];
      this.operaciones.subtotalCompra = this.operaciones.subtotalCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);
      this.operaciones.descuentoCompraArray.splice(i, 1);
      this.operaciones.descuentoCompraArray = [...this.operaciones.descuentoCompraArray];
      this.operaciones.descuentoCompra = this.operaciones.descuentoCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);
    } else {
      this.setOperaciones();
    }
  }

  addToCart(element: any = []) {
    try {
      if (JSON.parse(this.localStorageService.getItem(element._id)!)) {
        for (let i = 0; i < this.dataSourceCarItem.length; i++) {
          if (this.dataSourceCarItem[i]._id === element._id) {
            if (element.unidadMedida === this.isCentimetro) {
              this.construirArticulo(element);
              break;
            }
            /**
            if ((this.dataSourceCarItem[i].detalleArticulo[0].cantidad + 1) > element.inventarios[0].stock) {
              alert(`No hay suficiente Stock ${element.inventarios[0].stock}, para la cantidad de productos solicitados ${this.dataSourceCarItem[i].detalleArticulo[0].cantidad + 1}!`)
              break
            }
             */
            this.changeQty(this.dataSourceCarItem[i], i, 1, '');
            break
          }
        }
      } else {
        if (!element.inventarios[0] || !element.precios[0]) {
          alert(`Articulo sin configuración de Inventario y/o Precio Venta`);
          return;
        }
        this.construirArticulo(element);
      }
    } catch (error) {
      this.isLoadingResults = false;
      this.mensajeFallidoCliente = 'Error al cargar el producto. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

  construirArticulo(element: any) {
    try {
      const addItem: number = 1;
      element =
      {
        "_id": element._id,
        "stock": this.utilsService.numeros(element.inventarios[0].stock),
        "detalleArticulo": [
          {
            "codigo": element.codigo,
            "codigoBarras": element.codigoBarras,
            "descripcion": element.descripcion,
            "unidadMedida": element.unidadMedida,
            "cantidad": addItem,
            "precioVenta": this.utilsService.numeros(element.precios[0].precioVenta) > 0 ? element.precios[0].precioVenta : 0,
            "precioMayoreo": this.utilsService.numeros(element.precios[0].precioMayoreo) > 0 ? element.precios[0].precioMayoreo : 0,
            "precioInterno": this.utilsService.numeros(element.precios[0].precioInterno) > 0 ? element.precios[0].precioInterno : 0,
            "descuento": 0,
            "subtotal": this.utilsService.multiplicarNumero(this.utilsService.numeros(element.precios[0].precioVenta), addItem),
            "impuesto": this.utilsService.numeros(element.precios[0].impuestoUnitario) > 0 ? this.utilsService.numeros(element.precios[0].impuestoUnitario) : 0,
            "total": this.utilsService.multiplicarNumero(this.utilsService.numeros(element.precios[0].precioVenta), addItem),
            "mayoreo": false,
            "interno": false,
            "cotizacion": true
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

      this.operaciones.descuentoCompraArray = [...this.operaciones.descuentoCompraArray, this.utilsService.calcularDescuento(this.dataSourceCarItem[this.operaciones.cantidadArticulos - 1].detalleArticulo[0].valorUnitario, this.dataSourceCarItem[this.operaciones.cantidadArticulos - 1].detalleArticulo[0].cantidad, this.dataSourceCarItem[this.operaciones.cantidadArticulos - 1].detalleArticulo[0].descuento)]
      this.operaciones.descuentoCompra = this.operaciones.descuentoCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);
    } catch (error) {
      this.isLoadingResults = false;
      this.mensajeFallidoCliente = 'Error al cargar el producto. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }

  changeQty(element: any = [], i: number, qty: any, process: any) {

    if (process === 'replace') {
      this.localStorageService.removeItem(element._id);
      this.dataSourceCarItem[i].detalleArticulo[0].subtotal = this.utilsService.multiplicarNumero(element.detalleArticulo[0].precioVenta, element.detalleArticulo[0].cantidad);
      if (element.detalleArticulo[0].mayoreo) {
        this.dataSourceCarItem[i].detalleArticulo[0].descuento = this.utilsService.calcularDescuentoMayoreoInterno(element.detalleArticulo[0].subtotal, this.utilsService.multiplicarNumero(element.detalleArticulo[0].precioMayoreo, element.detalleArticulo[0].cantidad));
      }
      if (element.detalleArticulo[0].interno) {
        this.dataSourceCarItem[i].detalleArticulo[0].descuento = this.utilsService.calcularDescuentoMayoreoInterno(element.detalleArticulo[0].subtotal, this.utilsService.multiplicarNumero(element.detalleArticulo[0].precioInterno, element.detalleArticulo[0].cantidad));
      }
      if (!element.detalleArticulo[0].interno && !element.detalleArticulo[0].mayoreo) {
        this.dataSourceCarItem[i].detalleArticulo[0].descuento = 0;
      }
      this.dataSourceCarItem[i].detalleArticulo[0].total = this.utilsService.restarNumeros(this.dataSourceCarItem[i].detalleArticulo[0].subtotal, this.dataSourceCarItem[i].detalleArticulo[0].descuento)

      this.localStorageService.setItem(element._id, JSON.stringify(element));
      this.dataSourceCarItem.splice(i, 1, JSON.parse(this.localStorageService.getItem(this.dataSourceCarItem[i]._id)!));
      this.dataSourceCarItem = [...this.dataSourceCarItem];


      this.operaciones.totalArticulosArray.splice(i, 1, (parseInt(this.dataSourceCarItem[i].detalleArticulo[0].cantidad)));
      this.operaciones.totalArticulosArray = [...this.operaciones.totalArticulosArray];
      this.operaciones.totalArticulos = this.operaciones.totalArticulosArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);

      this.operaciones.subtotalCompraArray.splice(i, 1, this.dataSourceCarItem[i].detalleArticulo[0].subtotal);
      this.operaciones.subtotalCompraArray = [...this.operaciones.subtotalCompraArray];
      this.operaciones.subtotalCompra = this.operaciones.subtotalCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);

      this.operaciones.descuentoCompraArray.splice(i, 1, this.dataSourceCarItem[i].detalleArticulo[0].descuento);
      this.operaciones.descuentoCompraArray = [...this.operaciones.descuentoCompraArray];
      this.operaciones.descuentoCompra = this.operaciones.descuentoCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);
      return;
    } else {
      /** 
      if ((this.dataSourceCarItem[i].detalleArticulo[0].cantidad + qty) > element.stock) {
        alert(`No hay suficiente Stock ${element.stock}, para la cantidad de productos solicitados ${(this.dataSourceCarItem[i].detalleArticulo[0].cantidad + qty)}!`)
        return;
      }
      if ((this.dataSourceCarItem[i].detalleArticulo[0].cantidad + qty) === 0) {
        this.borrarArticuloCarItem(this.dataSourceCarItem[i], i);
        return;
      }
      */
      this.dataSourceCarItem[i].detalleArticulo[0].cantidad = this.dataSourceCarItem[i].detalleArticulo[0].cantidad + qty;
    }
    this.localStorageService.removeItem(this.dataSourceCarItem[i]._id);
    this.dataSourceCarItem[i].detalleArticulo[0].subtotal = this.utilsService.multiplicarNumero(this.dataSourceCarItem[i].detalleArticulo[0].precioVenta, this.dataSourceCarItem[i].detalleArticulo[0].cantidad);
    if (this.dataSourceCarItem[i].detalleArticulo[0].mayoreo) {
      this.dataSourceCarItem[i].detalleArticulo[0].descuento = this.utilsService.calcularDescuentoMayoreoInterno(this.dataSourceCarItem[i].detalleArticulo[0].subtotal, this.utilsService.multiplicarNumero(this.dataSourceCarItem[i].detalleArticulo[0].precioMayoreo, this.dataSourceCarItem[i].detalleArticulo[0].cantidad));
    }
    if (this.dataSourceCarItem[i].detalleArticulo[0].interno) {
      this.dataSourceCarItem[i].detalleArticulo[0].descuento = this.utilsService.calcularDescuentoMayoreoInterno(this.dataSourceCarItem[i].detalleArticulo[0].subtotal, this.utilsService.multiplicarNumero(this.dataSourceCarItem[i].detalleArticulo[0].precioInterno, this.dataSourceCarItem[i].detalleArticulo[0].cantidad));
    }
    if (!this.dataSourceCarItem[i].detalleArticulo[0].interno && !this.dataSourceCarItem[i].detalleArticulo[0].mayoreo) {
      this.dataSourceCarItem[i].detalleArticulo[0].descuento = 0;
    }
    this.dataSourceCarItem[i].detalleArticulo[0].total = this.utilsService.restarNumeros(this.dataSourceCarItem[i].detalleArticulo[0].subtotal, this.dataSourceCarItem[i].detalleArticulo[0].descuento)

    this.localStorageService.setItem(this.dataSourceCarItem[i]._id, JSON.stringify(this.dataSourceCarItem[i]));
    this.dataSourceCarItem.splice(i, 1, JSON.parse(this.localStorageService.getItem(this.dataSourceCarItem[i]._id)!));
    this.dataSourceCarItem = [...this.dataSourceCarItem];

    this.operaciones.totalArticulosArray.splice(i, 1, (parseInt(this.dataSourceCarItem[i].detalleArticulo[0].cantidad)));
    this.operaciones.totalArticulosArray = [...this.operaciones.totalArticulosArray];
    this.operaciones.totalArticulos = this.operaciones.totalArticulosArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);

    this.operaciones.subtotalCompraArray.splice(i, 1, this.dataSourceCarItem[i].detalleArticulo[0].subtotal);
    this.operaciones.subtotalCompraArray = [...this.operaciones.subtotalCompraArray];
    this.operaciones.subtotalCompra = this.operaciones.subtotalCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);

    this.operaciones.descuentoCompraArray.splice(i, 1, this.dataSourceCarItem[i].detalleArticulo[0].descuento);
    this.operaciones.descuentoCompraArray = [...this.operaciones.descuentoCompraArray];
    this.operaciones.descuentoCompra = this.operaciones.descuentoCompraArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);
  }

  cancelarCambios(element: any, i: number) {
    element.isEdit = false;
    this.dataSourceCarItem.splice(i, 1, JSON.parse(this.localStorageService.getItem(element._id)!));
    this.dataSourceCarItem = [...this.dataSourceCarItem];
  }

  setOperaciones() {
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

  buscarCotizacionDialogo(): void {
    this.dialogo
      .open(DialogoBuscarCotizacionComponent, {
        //data: message
      })
      .afterClosed()
      .subscribe((element: any = []) => {
        try {
          if (element.length !== 0) {
            for (let i = 0; i < element.articulo.length; i++) {
              this.buscarCatalogoCotizacion(element.articulo[i]);
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

      });
  }

}


export class Catalogo {
  constructor(public codigoBarras: String, public descripcion: String, public marca: string, public referencia: string,
    public ubicacion: string, public unidadMedida: string, public stock: string, public precioventa: string
  ) { }
}

export class carItem {
  constructor(public descripcion: String, public cantidad: string, public precio: string, public iva: string, public total: string, public isEdit: string) { }
}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }

}