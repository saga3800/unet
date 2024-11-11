
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { LocalStorageService } from '../local-storage.service';
import { UtilsService } from '../utils.service';

@Component({
  selector: 'app-dialogo.carItemVariable',
  templateUrl: './dialogo.carItemVariable.component.html',
  styleUrls: ['./dialogo.carItemVariable.component.css']
})
export class DialogoCarItemVariableComponent implements OnInit {

  matcher = new MyErrorStateMatcher();
  isVentaUnitaria : boolean = true;
  isPrecioVariable : boolean = false;
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
  precioVariableFormControl = new FormControl('');

  articuloCarItem = {
    descripcion: '',
    cantidad: 0,
    precioMenudeo: 0,
    precioVariable: 0,
    impuesto: 0,
    descuento: 0,
    total: 0,
  };

  constructor(
    public dialogo: MatDialogRef<DialogoCarItemVariableComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any = [], @Inject(MAT_DIALOG_DATA) public index: number,
    @Inject(LocalStorageService) private localStorageService: LocalStorageService, public utilsService: UtilsService) {
    this.isCotizacion = element.detalleArticulo[0].cotizacion ? true : false;
    this.articuloCarItem.cantidad = this.utilsService.numeros(element.detalleArticulo[0].cantidad);
    this.articuloCarItem.precioMenudeo = this.utilsService.numeros(element.detalleArticulo[0].precioVenta);
    this.articuloCarItem.descuento = this.utilsService.numeros(element.detalleArticulo[0].descuento);
    this.articuloCarItem.total = this.utilsService.numeros(element.detalleArticulo[0].total);
  }

  actualizar(): void {
    this.element.detalleArticulo[0].cantidad = this.articuloCarItem.cantidad;
    this.element.detalleArticulo[0].precioVenta = this.isPrecioVariable? this.utilsService.numeros(this.articuloCarItem.precioVariable) : this.articuloCarItem.precioMenudeo;
    this.element.detalleArticulo[0].total = this.articuloCarItem.total;
    if (this.isVentaUnitaria || this.isPrecioVariable) {
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
      this.isPrecioVariable = false;
      this.disabledButton = this.articuloCarItem.cantidad > 0 ? false : true;
      this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.articuloCarItem.precioMenudeo)
      this.onEnter(cantidad);
    } else {
      this.isPrecioVariable = true;
      if (!this.isVentaUnitaria && !this.isPrecioVariable) {
        this.disabledButton = true;
      }
    }
  };

  toggleVariable(estado: any, cantidad: any) {
    if (estado) {
      this.isVentaUnitaria = false;
      this.disabledButton = this.articuloCarItem.cantidad > 0 ? false : true;
      this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.articuloCarItem.precioVariable)
      this.onEnter(cantidad);
    } else {
      this.isVentaUnitaria = true;
      if (!this.isVentaUnitaria && !this.isPrecioVariable) {
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
      if (this.isPrecioVariable) {
        this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.articuloCarItem.precioVariable)
      }
      return;
    }

    if (this.utilsService.numeros(cantidad) <= this.utilsService.numeros(this.element.stock)) {
      this.articuloCarItem.cantidad = this.utilsService.numeros(cantidad);
      if (this.isVentaUnitaria) {
        this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.articuloCarItem.precioMenudeo)
      }
      if (this.isPrecioVariable) {
        this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.articuloCarItem.precioVariable);
      }
    }
    if (this.utilsService.numeros(cantidad) > this.utilsService.numeros(this.element.stock)) {
      this.disabledButton = true
      this.mensajeFallido = "No hay suficiente Stock " + this.element.stock + " para la cantidad de productos solicitados " + cantidad;
      this.articuloCarItem.cantidad = this.articuloCarItem.cantidad
      this.articuloCarItem.total = this.articuloCarItem.total;
    }
  }

  onEnterPrice(precio: any) {
    this.disabledButton = false;
    this.mensajeFallido = "";

    if (this.utilsService.numeros(precio) === 0) {
      this.disabledButton = true;
      return;
    }
    this.articuloCarItem.precioVariable = precio;
    if (this.isCotizacion) {
      if (this.isVentaUnitaria) {
        this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.articuloCarItem.precioMenudeo)
      }
      if (this.isPrecioVariable) {
        this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.articuloCarItem.precioVariable)
      }
      return;
    }

    if (this.utilsService.numeros(this.articuloCarItem.cantidad) <= this.utilsService.numeros(this.element.stock)) {
      if (this.isVentaUnitaria) {
        this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.articuloCarItem.precioMenudeo)
      }
      if (this.isPrecioVariable) {
        this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.articuloCarItem.precioVariable);
      }
    }
    if (this.utilsService.numeros(this.articuloCarItem.cantidad) > this.utilsService.numeros(this.element.stock)) {
      this.disabledButton = true
      this.mensajeFallido = "No hay suficiente Stock " + this.element.stock + " para la cantidad de productos solicitados " + this.articuloCarItem.cantidad;
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