
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { LocalStorageService } from '../local-storage.service';
import { UtilsService } from '../utils.service';

@Component({
  selector: 'app-dialogo.carItemCentimetro',
  templateUrl: './dialogo.carItemCentimetro.component.html',
  styleUrls: ['./dialogo.carItemCentimetro.component.css']
})
export class DialogoCarItemCentimetroComponent implements OnInit {

  matcher = new MyErrorStateMatcher();
  isPrecioCentimetro: boolean = true;
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
  precioCentimetroFormControl = new FormControl('').disabled;

  articuloCarItem = {
    descripcion: '',
    cantidad: 1,
    precioMenudeo: 0,
    precioMayoreo: 0,
    precioMinimo: 0,
    precioCentimetro: 0,
    dimensionTotal:0,
    ancho: 0,
    alto: 0,
    impuesto: 0,
    descuento: 0,
    total: 0,
  };

  constructor(
    public dialogo: MatDialogRef<DialogoCarItemCentimetroComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any = [], @Inject(MAT_DIALOG_DATA) public index: number,
    @Inject(LocalStorageService) private localStorageService: LocalStorageService, public utilsService: UtilsService) {
    this.isCotizacion = element.detalleArticulo[0].cotizacion ? true : false;
    this.articuloCarItem.cantidad = this.articuloCarItem.cantidad;
    this.articuloCarItem.precioMenudeo = this.utilsService.numeros(element.detalleArticulo[0].precioVenta);
    this.articuloCarItem.precioCentimetro = this.utilsService.numeros(element.detalleArticulo[0].precioMayoreo);
    this.articuloCarItem.precioMinimo = this.utilsService.numeros(element.detalleArticulo[0].precioInterno);
    this.articuloCarItem.descuento = this.utilsService.numeros(element.detalleArticulo[0].descuento);
    this.articuloCarItem.total = this.utilsService.numeros(element.detalleArticulo[0].total);
    console.log(element);
  }

  actualizar(): void {
    if(this.utilsService.numeros(this.articuloCarItem.total) >= this.utilsService.numeros(this.articuloCarItem.precioMinimo)){
      this.element.detalleArticulo[0].cantidad = this.utilsService.multiplicarNumero(this.articuloCarItem.dimensionTotal,this.articuloCarItem.cantidad);
      this.element.detalleArticulo[0].precioVenta = Number(this.utilsService.numeros(this.articuloCarItem.total)/this.utilsService.numeros(this.element.detalleArticulo[0].cantidad)).toFixed(2);
      this.element.detalleArticulo[0].total = this.articuloCarItem.total;
    }else{
      this.articuloCarItem.total = this.articuloCarItem.precioMinimo;
      this.element.detalleArticulo[0].cantidad = this.utilsService.multiplicarNumero(this.articuloCarItem.dimensionTotal,this.articuloCarItem.cantidad);
      this.element.detalleArticulo[0].precioVenta = Number(this.utilsService.numeros(this.articuloCarItem.total)/this.utilsService.numeros(this.element.detalleArticulo[0].cantidad)).toFixed(2);
      this.element.detalleArticulo[0].total = this.articuloCarItem.total;
    }
    this.element.detalleArticulo[0].descuento = 0;
    this.dialogo.close(true);
  }

  cerrar(): void {
    this.articuloCarItem.cantidad = this.articuloCarItem.cantidad
    this.articuloCarItem.total = this.articuloCarItem.total;
    this.dialogo.close(false);
  }
  ;

  toggleCentimetro() {
    this.disabledButton = !this.isPrecioCentimetro
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
      //this.articuloCarItem.precioCentimetro = this.utilsService.multiplicarNumero(this.utilsService.multiplicarNumero(this.articuloCarItem.alto, this.articuloCarItem.ancho),this.articuloCarItem.precioCentimetro)
      this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.utilsService.multiplicarNumero(this.articuloCarItem.dimensionTotal, this.articuloCarItem.precioCentimetro))
      return;
    }

    if (this.utilsService.multiplicarNumero(this.utilsService.numeros(cantidad), this.articuloCarItem.dimensionTotal) <= this.utilsService.numeros(this.element.stock)) {
      this.articuloCarItem.cantidad = this.utilsService.numeros(cantidad);
      //this.articuloCarItem.precioCentimetro = this.utilsService.multiplicarNumero(this.utilsService.multiplicarNumero(this.articuloCarItem.alto, this.articuloCarItem.ancho),this.articuloCarItem.precioCentimetro)
      this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.utilsService.multiplicarNumero(this.articuloCarItem.dimensionTotal, this.articuloCarItem.precioCentimetro))
      return;
    }
    if (this.utilsService.multiplicarNumero(this.utilsService.numeros(cantidad), this.articuloCarItem.dimensionTotal) > this.utilsService.numeros(this.element.stock)) {
      this.disabledButton = true
      this.mensajeFallido = "No hay suficiente Stock " + this.element.stock + " para la cantidad de productos solicitados " + cantidad;
      this.articuloCarItem.precioCentimetro = this.articuloCarItem.precioCentimetro
      this.articuloCarItem.cantidad = this.articuloCarItem.cantidad
      this.articuloCarItem.total = this.articuloCarItem.total;
    }
  }

  onEnterAlto(medida: any) {
    this.disabledButton = false;
    this.mensajeFallido = "";

    if (this.utilsService.numeros(medida) === 0) {
      this.disabledButton = true;
      return;
    }
    this.articuloCarItem.alto = medida;
    if (this.isCotizacion) {
      //this.articuloCarItem.precioCentimetro = this.utilsService.multiplicarNumero(this.utilsService.multiplicarNumero(this.articuloCarItem.alto, this.articuloCarItem.ancho),this.articuloCarItem.precioCentimetro)
      this.articuloCarItem.dimensionTotal = this.utilsService.multiplicarNumero(this.articuloCarItem.alto, this.articuloCarItem.ancho)
      this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.utilsService.multiplicarNumero(this.articuloCarItem.dimensionTotal, this.articuloCarItem.precioCentimetro))
      return;
    }

    if (this.utilsService.numeros(this.articuloCarItem.cantidad) <= this.utilsService.numeros(this.element.stock)) {
      //this.articuloCarItem.precioCentimetro = this.utilsService.multiplicarNumero(this.utilsService.multiplicarNumero(this.articuloCarItem.alto, this.articuloCarItem.ancho),this.articuloCarItem.precioCentimetro)
      this.articuloCarItem.dimensionTotal = this.utilsService.multiplicarNumero(this.articuloCarItem.alto, this.articuloCarItem.ancho)
      this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.utilsService.multiplicarNumero(this.articuloCarItem.dimensionTotal, this.articuloCarItem.precioCentimetro))
    }
    if (this.utilsService.numeros(this.articuloCarItem.cantidad) > this.utilsService.numeros(this.element.stock)) {
      this.disabledButton = true
      this.mensajeFallido = "No hay suficiente Stock " + this.element.stock + " para la cantidad de productos solicitados " + this.articuloCarItem.cantidad;
      this.articuloCarItem.precioCentimetro = this.articuloCarItem.precioCentimetro
      this.articuloCarItem.cantidad = this.articuloCarItem.cantidad
      this.articuloCarItem.total = this.articuloCarItem.total;
    }
  }

  onEnterAncho(medida: any) {
    this.disabledButton = false;
    this.mensajeFallido = "";

    if (this.utilsService.numeros(medida) === 0) {
      this.disabledButton = true;
      return;
    }
    this.articuloCarItem.ancho = medida;
    if (this.isCotizacion) {
      //this.articuloCarItem.precioCentimetro = this.utilsService.multiplicarNumero(this.utilsService.multiplicarNumero(this.articuloCarItem.alto, this.articuloCarItem.ancho),this.articuloCarItem.precioCentimetro)
      this.articuloCarItem.dimensionTotal = this.utilsService.multiplicarNumero(this.articuloCarItem.alto, this.articuloCarItem.ancho)
      this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.utilsService.multiplicarNumero(this.articuloCarItem.dimensionTotal, this.articuloCarItem.precioCentimetro))
      return;
    }

    if (this.utilsService.numeros(this.articuloCarItem.cantidad) <= this.utilsService.numeros(this.element.stock)) {
      //this.articuloCarItem.precioCentimetro = this.utilsService.multiplicarNumero(this.utilsService.multiplicarNumero(this.articuloCarItem.alto, this.articuloCarItem.ancho),this.articuloCarItem.precioCentimetro)
      this.articuloCarItem.dimensionTotal = this.utilsService.multiplicarNumero(this.articuloCarItem.alto, this.articuloCarItem.ancho)
      this.articuloCarItem.total = this.utilsService.multiplicarNumero(this.articuloCarItem.cantidad, this.utilsService.multiplicarNumero(this.articuloCarItem.dimensionTotal, this.articuloCarItem.precioCentimetro))
    }
    if (this.utilsService.numeros(this.articuloCarItem.cantidad) > this.utilsService.numeros(this.element.stock)) {
      this.disabledButton = true
      this.mensajeFallido = "No hay suficiente Stock " + this.element.stock + " para la cantidad de productos solicitados " + this.articuloCarItem.cantidad;
      this.articuloCarItem.precioCentimetro = this.articuloCarItem.precioMenudeo
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