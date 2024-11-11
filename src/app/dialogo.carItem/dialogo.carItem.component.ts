
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { LocalStorageService } from '../local-storage.service';
import { UtilsService } from '../utils.service';

@Component({
  selector: 'app-dialogo.carItem',
  templateUrl: './dialogo.carItem.component.html',
  styleUrls: ['./dialogo.carItem.component.css']
})
export class DialogoCarItemComponent implements OnInit {

  matcher = new MyErrorStateMatcher();
  isVentaUnitaria !: boolean;
  isVentaMayoreo !: boolean;
  isVentaInterna !: boolean;
  isCotizacion !: boolean;
  disabledButton !: boolean;
  mensajeFallido: string = '';
  /**
   * Control Error Textfields carItem
   */
  descripcionFormControl = new FormControl('');
  cantidadFormControl = new FormControl('');
  precioFormControl = new FormControl('');
  impuestoFormControl = new FormControl('');
  descuentoFormControl = new FormControl('');
  totalFormControl = new FormControl('');

  articuloCarItem = {
    descripcion: '',
    cantidad: 0,
    precioMenudeo: 0,
    precioMayoreo: 0,
    precioInterno: 0,
    impuesto: 0,
    descuento: 0,
    total: 0,
  };

  constructor(
    public dialogo: MatDialogRef<DialogoCarItemComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any = [], @Inject(MAT_DIALOG_DATA) public index: number,
    @Inject(LocalStorageService) private localStorageService: LocalStorageService, public utilsService: UtilsService) {
    this.isVentaUnitaria = element.detalleArticulo[0].mayoreo || element.detalleArticulo[0].interno ? false : true;
    this.isVentaMayoreo = element.detalleArticulo[0].mayoreo ? true : false;
    this.isVentaInterna = element.detalleArticulo[0].interno ? true : false;
    this.isCotizacion = element.detalleArticulo[0].cotizacion ? true : false;
    this.articuloCarItem.cantidad = this.utilsService.numeros(element.detalleArticulo[0].cantidad);
    this.articuloCarItem.precioMenudeo = this.utilsService.numeros(element.detalleArticulo[0].precioVenta);
    this.articuloCarItem.precioMayoreo = this.utilsService.numeros(element.detalleArticulo[0].precioMayoreo);
    this.articuloCarItem.precioInterno = this.utilsService.numeros(element.detalleArticulo[0].precioInterno);
    this.articuloCarItem.descuento = this.utilsService.numeros(element.detalleArticulo[0].descuento);
    this.articuloCarItem.total = this.utilsService.numeros(element.detalleArticulo[0].total);
  }

  actualizar(): void {
    this.element.detalleArticulo[0].mayoreo = this.isVentaMayoreo ? true : false
    this.element.detalleArticulo[0].interno = this.isVentaInterna ? true : false
    this.element.detalleArticulo[0].cantidad = this.articuloCarItem.cantidad;
    this.element.detalleArticulo[0].precioVenta = this.articuloCarItem.precioMenudeo;
    this.element.detalleArticulo[0].precioMayoreo = this.articuloCarItem.precioMayoreo;
    this.element.detalleArticulo[0].precioInterno = this.articuloCarItem.precioInterno;
    this.element.detalleArticulo[0].total = this.articuloCarItem.total;
    if (this.isVentaMayoreo) {
      this.element.detalleArticulo[0].descuento = this.utilsService.calcularDescuentoMayoreoInterno(this.articuloCarItem.total, this.utilsService.multiplicarNumero(this.articuloCarItem.precioMayoreo, this.articuloCarItem.cantidad));
    }
    if (this.isVentaInterna) {
      this.element.detalleArticulo[0].descuento = this.utilsService.calcularDescuentoMayoreoInterno(this.articuloCarItem.total, this.utilsService.multiplicarNumero(this.articuloCarItem.precioInterno, this.articuloCarItem.cantidad));
    }
    if (this.isVentaUnitaria) {
      this.element.detalleArticulo[0].descuento = 0;
    }
    this.dialogo.close(true);
  }

  cerrar(): void {
    this.articuloCarItem.cantidad = this.articuloCarItem.cantidad
    this.articuloCarItem.total = this.articuloCarItem.total;
    this.dialogo.close(false);
  }

  toggleUnitario(estado: any, cantidad: any) {

    if (estado) {
      this.disabledButton = this.articuloCarItem.cantidad > 0 ? false : true;
      this.isVentaMayoreo = false;
      this.isVentaInterna = false;
      this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.articuloCarItem.precioMenudeo)
      this.isVentaUnitaria = estado;
      this.onEnter(cantidad);
    } else {
      if (!this.isVentaMayoreo && !this.isVentaInterna) {
        this.disabledButton = true;
      }
    }
  };

  toggleMayoreo(estado: any, cantidad: any) {
    if (estado) {
      this.disabledButton = this.articuloCarItem.cantidad > 0 ? false : true;
      this.isVentaUnitaria = false;
      this.isVentaInterna = false;
      this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.articuloCarItem.precioMayoreo)
      this.isVentaMayoreo = estado;
      this.onEnter(cantidad);
    } else {
      if (!this.isVentaUnitaria && !this.isVentaInterna) {
        this.disabledButton = true;
      }
    }
  };

  toggleInterno(estado: any, cantidad: any) {
    if (estado) {
      this.disabledButton = this.articuloCarItem.cantidad > 0 ? false : true;
      this.isVentaUnitaria = false;
      this.isVentaMayoreo = false;
      this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.articuloCarItem.precioInterno)
      this.isVentaInterna = estado;
      this.onEnter(cantidad);
    } else {
      if (!this.isVentaMayoreo && !this.isVentaUnitaria) {
        this.disabledButton = true;
      }
    }
  };

  onEnter(cantidad: any) {
    this.disabledButton = false;
    this.mensajeFallido = "";
    if (this.utilsService.numeros(cantidad) === 0) {
      this.disabledButton = true;
      return;
    }
    if (this.isCotizacion) {
      this.articuloCarItem.cantidad = this.utilsService.numeros(cantidad);
      if (this.isVentaUnitaria) {
        this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.articuloCarItem.precioMenudeo)
      }
      if (this.isVentaMayoreo) {
        this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.articuloCarItem.precioMayoreo);
      }
      if (this.isVentaInterna) {
        this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.articuloCarItem.precioInterno);
      }
      return;
    }

    if (this.utilsService.numeros(cantidad) <= this.utilsService.numeros(this.element.stock)) {
      this.articuloCarItem.cantidad = this.utilsService.numeros(cantidad);
      if (this.isVentaUnitaria) {
        this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.articuloCarItem.precioMenudeo)
      }
      if (this.isVentaMayoreo) {
        this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.articuloCarItem.precioMayoreo);
      }
      if (this.isVentaInterna) {
        this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.articuloCarItem.precioInterno);
      }
    }
    if (this.utilsService.numeros(cantidad) > this.utilsService.numeros(this.element.stock)) {
      this.disabledButton = true
      this.mensajeFallido = "No hay suficiente Stock " + this.element.stock + " para la cantidad de productos solicitados " + cantidad;
      this.articuloCarItem.cantidad = this.articuloCarItem.cantidad
      this.articuloCarItem.total = this.articuloCarItem.total;
    }
  }

  ngOnInit() {
  }
}
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