import { ChangeDetectorRef, Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TokenService } from '../login/token';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { DialogoConfirmacionComponent } from "../dialogo.confirmacion/dialogo.component";
import { NavigationEnd, Router } from '@angular/router';
import { Target } from '@angular/compiler';
import { Subscription } from 'rxjs/internal/Subscription';
import { filter } from 'rxjs';
import { UtilsService } from '../utils.service';
import { PrinterUtilsService } from '../printerUtils.service';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { TableUtilsService } from '../tableUtils.service';
import { LocalStorageService } from '../local-storage.service';

/** Setear fechas */
//const today = new Date();
const month = new Date().getMonth();
const year = new Date().getFullYear();
const day = new Date().getDate();

@Component({
  selector: 'app-administrarCaja',
  templateUrl: './administrar.component.html',
  styleUrls: ['./caja.component.css'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'es-CO' }],
})

export class AdministrarCajaComponent {

  constructor(private router: Router, private http: HttpClient, public tokenService: TokenService, public dialogo: MatDialog,
    public localStorageService: LocalStorageService, private changeDetector: ChangeDetectorRef, public utilsService: UtilsService,
    @Inject(MAT_DATE_LOCALE) private _locale: string, public printerUtilsService: PrinterUtilsService, public tableUtilsService: TableUtilsService) { }


  columnas: string[] = ['No', 'tipo', 'razon', 'fecha', 'efectivo', 'transferencia', 'valor', 'user', 'observacion'];

  openedMenu!: boolean;
  dataSourceMovimientos: any = [];
  dataSourceAddMovements: any = [];
  dataSourceCajas: any = [];
  ubicaciones: any[] = [];

  isLoadingResults: boolean = false;
  //Pagination
  pageEvent!: PageEvent;
  pageIndex: number = 0;
  pageSize !: number;
  length!: number;
  pageSizeOptions = [20];
  subscriber!: Subscription;
  //Valores
  ventaInterna: String = "INT";
  entrada: String = "ENT";
  salida: String = "SAL";
  puntoVenta: String = "PDV"
  openDisabled: Boolean = false;

  //Datos para operaciones
  startDate!: any;
  endDate!: any;
  id!: any;
  localStorageUser !: any;
  localStorageCashier !: any;

  /**
   * Control Error Textfields Providers
   */
  nombreFormControl = new FormControl('', [Validators.required]);
  tipoCajaFormControl = new FormControl('', [Validators.required]);
  ubicacionCajaFormControl = new FormControl({ value: '', disabled: true }, [Validators.required]);
  baseAperturaFormControl = new FormControl('', [Validators.required]);
  consumoInternoFormControl = new FormControl('', [Validators.required]);
  tipoMovimientoFormControl = new FormControl('', [Validators.required]);
  valorMovimientoFormControl = new FormControl('', [Validators.required]);
  razonMovimientoFormControl = new FormControl('', [Validators.required]);
  totalFormControl = new FormControl('', [Validators.required]);
  tipoFormControl = new FormControl('', [Validators.required]);
  razonDocumentoFormControl = new FormControl('', [Validators.required]);
  fechaRazonSocialFormControl = new FormControl('', [Validators.required]);
  valorFormControl = new FormControl('', [Validators.required]);
  userFormControl = new FormControl('', [Validators.required]);
  observacionFormControl = new FormControl('', [Validators.required]);
  fieldStartDateFormControl = new FormControl(new Date(year, month, day));
  metodoPagoMovimientoFormControl = new FormControl('', [Validators.required]);

  nuevaCaja: any = {
    nombre: '',
    tipoCaja: '',
    ubicacionCaja: '',
    baseApertura: '',
    consumoInterno: '',
    totalEFectivo: '',
    totalTransferencia: '',
    totalRetiros: '',
    totalRetirosTransferencia: '',
    totalBaseEfectivo: '',
    total: '',
    tipo: '',
    razon: '',
    fecha: '',
    valor: '',
    user: '',
    observacion: '',
    tipoMovimiento: '',
    razonMovimiento: 'ADM',
    valorMovimiento: '',
    observacionMovimiento: '',
    metodoPagoMovimiento: '',
    efectivoMovimiento: '',
    transferenciaMovimiento: '',
  };

  matcher = new MyErrorStateMatcher();
  mensajeExitosoArticulo: string = '';
  mensajeFallidoArticulo: string = '';
  mensajeExitoso: string = '';
  mensajeFallido: string = '';



  ngOnInit() {
    this.subscriber = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => { });
    this.cargarUbicaciones();
    this.buscarCajaAbierta();
  }

  ngOnDestroy() {
    this.subscriber?.unsubscribe();
  }

  ngAfterContentChecked() {
    this.changeDetector.detectChanges();
  }

  @ViewChild("inputCode") InputField: any = ElementRef;

  async buscarCajaAbierta() {
    this.startDate = new Date(year, month, day);
    this.endDate = new Date(year, month, day + 1);
    const token = this.tokenService.token;
    //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2M3YzI2ZDI5NDRiMmM2MWFiZWQ5NCIsImlhdCI6MTcxMzcxNjI1MCwiZXhwIjoxNzEzODAyNjUwfQ.Rdrzuw4gVl5B2n3cBUsxxzOuTo3W_f4EkxvWOYMMKhM"
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
              alert("No Existe Caja Abierta");
              return;
            case 1:
              this.openDisabled = true;
              this.nuevaCaja.nombre = this.dataSourceCajas[0].nombreCaja
              this.nuevaCaja.tipoCaja = this.dataSourceCajas[0].tipoCaja
              this.nuevaCaja.ubicacionCaja = response.Data[0].ubicacionCaja
              this.nuevaCaja.baseApertura = this.dataSourceCajas[0].baseApertura
              this.dataSourceMovimientos = this.dataSourceCajas[0].movimientos
              if (this.dataSourceMovimientos.length > 0) {
                this.dataSourceMovimientos = this.dataSourceMovimientos.filter(((arr: { razon: any; }) => arr.razon === this.ventaInterna))
                this.nuevaCaja.consumoInterno = this.dataSourceMovimientos.map((t: { valorTotal: string | number; }) => +t.valorTotal).reduce((acc: any, value: any) => acc + value, 0);
                this.dataSourceMovimientos = this.dataSourceCajas[0].movimientos
                this.dataSourceMovimientos = this.dataSourceMovimientos.filter(((arr: { razon: any; tipo: any }) => arr.razon !== this.ventaInterna && arr.tipo === this.entrada))
                this.nuevaCaja.total = this.dataSourceMovimientos.map((t: { valorTotal: string | number; }) => +t.valorTotal).reduce((acc: any, value: any) => acc + value, 0) + this.nuevaCaja.baseApertura;
                this.nuevaCaja.totalEfectivo = this.dataSourceMovimientos.map((t: { valorEfectivo: string | number; }) => +t.valorEfectivo).reduce((acc: any, value: any) => acc + value, 0);
                this.nuevaCaja.totalTransferencia = this.dataSourceMovimientos.map((t: { valorTransferencia: string | number; }) => +t.valorTransferencia).reduce((acc: any, value: any) => acc + value, 0);
                this.dataSourceMovimientos = this.dataSourceCajas[0].movimientos
                this.dataSourceMovimientos = this.dataSourceMovimientos.filter(((arr: { tipo: any; }) => arr.tipo === this.salida))
                this.nuevaCaja.totalRetiros = this.dataSourceMovimientos.map((t: { valorEfectivo: string | number; }) => +t.valorEfectivo).reduce((acc: any, value: any) => acc + value, 0);
                this.dataSourceMovimientos = this.dataSourceCajas[0].movimientos
                this.dataSourceMovimientos = this.dataSourceMovimientos.filter(((arr: { tipo: any; }) => arr.tipo === this.salida))
                this.nuevaCaja.totalRetirosTransferencia = this.dataSourceMovimientos.map((t: { valorTransferencia: string | number; }) => +t.valorTransferencia).reduce((acc: any, value: any) => acc + value, 0);
                this.dataSourceMovimientos = this.dataSourceCajas[0].movimientos
              }
              /**
               * Ajuste por devoluciones
               */
              this.nuevaCaja.totalTransferencia = this.nuevaCaja.totalTransferencia + this.nuevaCaja.totalRetirosTransferencia
              this.nuevaCaja.total = this.nuevaCaja.total + this.nuevaCaja.totalRetirosTransferencia
              //
              this.nuevaCaja.totalBaseEfectivo = this.nuevaCaja.baseApertura + this.nuevaCaja.totalRetiros + this.nuevaCaja.totalEfectivo
              this.dataSourceMovimientos = new MatTableDataSource(this.dataSourceMovimientos)
              return;
            default:
              alert("Mas de una caja abierta");
              return;
          }
        }, error => {
          this.isLoadingResults = false;
          if (error.status === 401) {
            this.routerLinkLogin();
          }
          if (error.status === 404) {
            alert("No Existe Caja Abierta")
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

  async buscarMovimientos() {
    const token = this.tokenService.token;
    //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2M3YzI2ZDI5NDRiMmM2MWFiZWQ5NCIsImlhdCI6MTcxMzcxNjI1MCwiZXhwIjoxNzEzODAyNjUwfQ.Rdrzuw4gVl5B2n3cBUsxxzOuTo3W_f4EkxvWOYMMKhM"
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`,
      })
    };
    this.isLoadingResults = true;
    try {
      let httpParams = new HttpParams();
      if (this.startDate && this.endDate) {
        httpParams = httpParams.append('startDate', this.startDate);
        httpParams = httpParams.append('endDate', this.endDate);
      }
      this.http.get<any>(`https://p01--node-launet2--m5lw8pzgzy2k.code.run/api/cashierMovements?${httpParams}`, httpOptions)
        //this.http.get<any>(`http://localhost:3030/api/cashierMovements?${httpParams}`, httpOptions)
        .subscribe(response => {
          if (response.Status) {
            this.nuevaCaja.baseApertura = response.Data[0].baseApertura
            this.dataSourceMovimientos = response.Data[0].movimientos;
            if (this.dataSourceMovimientos.length > 0) {
              this.dataSourceMovimientos = this.dataSourceMovimientos.filter(((arr: { razon: any; }) => arr.razon === this.ventaInterna))
              this.nuevaCaja.consumoInterno = this.dataSourceMovimientos.map((t: { valorTotal: string | number; }) => +t.valorTotal).reduce((acc: any, value: any) => acc + value, 0);
              this.dataSourceMovimientos = response.Data[0].movimientos
              this.dataSourceMovimientos = this.dataSourceMovimientos.filter(((arr: { tipo: any; }) => arr.tipo === this.salida))
              this.nuevaCaja.totalRetiros = this.dataSourceMovimientos.map((t: { valorTotal: string | number; }) => +t.valorTotal).reduce((acc: any, value: any) => acc + value, 0);
              this.dataSourceMovimientos = response.Data[0].movimientos
              this.dataSourceMovimientos = this.dataSourceMovimientos.filter(((arr: { tipo: any; }) => arr.tipo === this.salida))
              this.nuevaCaja.totalRetirosTransferencia = this.dataSourceMovimientos.map((t: { valorTransferencia: string | number; }) => +t.valorTransferencia).reduce((acc: any, value: any) => acc + value, 0);
              this.dataSourceMovimientos = this.dataSourceCajas[0].movimientos
              this.dataSourceMovimientos = this.dataSourceMovimientos.filter(((arr: { razon: any; tipo: any }) => arr.razon !== this.ventaInterna && arr.tipo === this.entrada))
              this.nuevaCaja.total = this.dataSourceMovimientos.map((t: { valorTotal: string | number; }) => +t.valorTotal).reduce((acc: any, value: any) => acc + value, 0) + this.nuevaCaja.baseApertura;
              this.nuevaCaja.totalEfectivo = this.dataSourceMovimientos.map((t: { valorEfectivo: string | number; }) => +t.valorEfectivo).reduce((acc: any, value: any) => acc + value, 0);
              this.nuevaCaja.totalTransferencia = this.dataSourceMovimientos.map((t: { valorTransferencia: string | number; }) => +t.valorTransferencia).reduce((acc: any, value: any) => acc + value, 0);
              this.dataSourceMovimientos = response.Data[0].movimientos
            }
          }
          /**
           * Ajuste por devoluciones
           */
          this.nuevaCaja.totalTransferencia = this.nuevaCaja.totalTransferencia + this.nuevaCaja.totalRetirosTransferencia
          this.nuevaCaja.total = this.nuevaCaja.total + this.nuevaCaja.totalRetirosTransferencia
          //
          this.nuevaCaja.totalBaseEfectivo = this.nuevaCaja.baseApertura + this.nuevaCaja.totalRetiros + this.nuevaCaja.totalEfectivo
          this.dataSourceMovimientos = new MatTableDataSource(this.dataSourceMovimientos)
          this.isLoadingResults = false;

        }, error => {
          this.isLoadingResults = false;
          if (error.status === 401) {
            this.routerLinkLogin();
          }
          if (error.status === 404) {
            alert("Fecha de caja No encontrada")
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

  mostrarDialogo(message: string, process: number, element: any, i: number): void {
    this.dialogo
      .open(DialogoConfirmacionComponent, {
        data: message
      })
      .afterClosed()
      .subscribe((confirmar: Boolean) => {
        if (confirmar) {
          if (process === 1) {
            this.routerLinkCaja();
          }
          if (process === 2) {
            this.refreshPage();
          }
          if (process === 3) {
            //alert("No hacer nada");
          }
        } else { }
      });
  }

  routerLinkCaja(): void {
    this.router.navigate(['/registrarCaja'])
  };

  routerLinkLogin(): void {
    this.router.navigate(['/login'])
    this.localStorageService.clear();
  };

  filtrarCaja(event: Event) {
    const filtro = (event as Target as HTMLInputElement).value;
    return this.dataSourceCajas.filter = filtro.trim().toLowerCase().includes;
  }

  applyFilter() {
    this.fieldStartDateFormControl.setValue(this.startDate);
    this.buscarMovimientos();
  }

  addEvent(event: MatDatepickerInputEvent<Date>) {
    this.startDate = event.value;
    this.endDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() + 1);
  }

  applyClear() {
    this.startDate = new Date(year, month, day);
    this.endDate = new Date(year, month, day + 1);
    this.fieldStartDateFormControl.setValue(this.startDate);
    this.setResumenMovimientos();
    this.buscarMovimientos();
  }

  refreshPage() {
    window.location.reload();
  }

  changeList(value: any) {
    if (value === 'TRANSFERENCIA') {
      this.nuevaCaja.efectivoMovimiento = 0;
    }
    if (value === 'EFECTIVO') {
      this.nuevaCaja.transferenciaMovimiento = 0;
    }
    this.nuevaCaja.valorMovimiento = this.nuevaCaja.efectivoMovimiento + this.nuevaCaja.transferenciaMovimiento;
  }

  onEnter() {
    this.nuevaCaja.valorMovimiento = this.nuevaCaja.efectivoMovimiento + this.nuevaCaja.transferenciaMovimiento;
  }

  applyMovement() {
    if (this.nuevaCaja.valorMovimiento === 0) {
      alert("Total Movimiento tiene valor CERO");
      return;
    }
    this.applyMovements();
  }

  async applyMovements() {
    const url = `https://p01--node-launet2--m5lw8pzgzy2k.code.run/api/cashierMovements/${this.dataSourceCajas[0]._id}`
    //const url = `http://localhost:3030/api/cashierMovements/${this.dataSourceCajas[0]._id}`
    const body =
    {
      "tipo": this.nuevaCaja.tipoMovimiento,
      "razon": this.nuevaCaja.razonMovimiento,
      "fecha": new Date(year, month, day),
      "valorEfectivo": this.nuevaCaja.tipoMovimiento === this.salida ? -this.nuevaCaja.efectivoMovimiento : this.nuevaCaja.efectivoMovimiento,
      "valorTransferencia": this.nuevaCaja.tipoMovimiento === this.salida ? -this.nuevaCaja.transferenciaMovimiento : this.nuevaCaja.transferenciaMovimiento,
      "valorTotal": this.nuevaCaja.tipoMovimiento === this.salida ? -this.nuevaCaja.valorMovimiento : this.nuevaCaja.valorMovimiento,
      "user": this.tokenService.userName,
      "cliente": '',
      "observacion": this.nuevaCaja.observacionMovimiento,
    }
    const token = this.tokenService.token;
    //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2M3YzI2ZDI5NDRiMmM2MWFiZWQ5NCIsImlhdCI6MTcxMzcxNjI1MCwiZXhwIjoxNzEzODAyNjUwfQ.Rdrzuw4gVl5B2n3cBUsxxzOuTo3W_f4EkxvWOYMMKhM"
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
      this.mensajeExitoso = "Movimiento registrado exitosamente"
      this.printerUtilsService.connectToPrinter(false, body)
      setTimeout(() => {
        this.applyClear();
      }, 500);
    } catch (error) {
      this.mensajeFallido = 'Error al editar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
    this.isLoadingResults = false;
    this.setNuevaCaja()
    setTimeout(() => {
      this.mensajeExitoso = '';
      this.mensajeFallido = '';
    }, 5000);
  }

  setNuevaCaja() {
    this.nuevaCaja.tipoMovimiento = '',
      this.tipoMovimientoFormControl.reset(),
      this.nuevaCaja.razonMovimiento = 'ADM',
      this.razonMovimientoFormControl.reset(),
      this.nuevaCaja.valorMovimiento = '',
      this.nuevaCaja.observacionMovimiento = '',
      this.observacionFormControl.reset();
    this.nuevaCaja.metodoPagoMovimiento = '',
      this.metodoPagoMovimientoFormControl.reset();
    this.nuevaCaja.efectivoMovimiento = '',
      this.nuevaCaja.transferenciaMovimiento = ''
  };

  setResumenMovimientos() {
    this.nuevaCaja.baseApertura = '',
      this.nuevaCaja.consumoInterno = '',
      this.nuevaCaja.totalEFectivo = '',
      this.nuevaCaja.totalTransferencia = '',
      this.nuevaCaja.totalRetiros = '',
      this.nuevaCaja.totalRetirosTransferencia = '',
      this.nuevaCaja.total = '',
      this.nuevaCaja.totalBaseEfectivo = ''
  };

  filtrar(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    this.dataSourceMovimientos.filter = filtro.trim().toLowerCase();
  }
}

export class compras {
  constructor(public No: String, public tipo: String, public razon: string, public fecha: Date,
    public valor: Number, public user: string, public observación: string
  ) { }
}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }

}
