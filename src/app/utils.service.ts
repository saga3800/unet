import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  //Formateo Fechas
  getDate(date: any) {
    try {
      if (date !== null){
        return new Intl.DateTimeFormat("az", {year: "numeric", month: "2-digit",  day: "2-digit" }).format(new Date(date));
      }else{
      return Intl.DateTimeFormat('es-CO', { dateStyle: "medium", timeStyle: "short" }).format(new Date());
      }
    } catch {
      return false;
    }
  };

  //Formateo Monedas
  getCurrency(value: any) {
    try {
      return new Intl.NumberFormat("en-ES", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(+(value));
    } catch {
      return false;
    }
  };

  //Sumar valores
  sumarNumeros(a: number, b: number) {
    a = !isNaN(a) && typeof a !== 'boolean' ? +a : 0;
    b = !isNaN(b) && typeof b !== 'boolean' ? +b : 0;
    return (a + b);
  }

  //Multiplicar valores
  multiplicarNumero(a: number, b: number) {
    a = !isNaN(a) && typeof a !== 'boolean' ? +a : 0;
    b = !isNaN(b) && typeof b !== 'boolean' ? +b : 0;
    return (a * b);
  }

  //Restar valores
  restarNumeros(a: number, b: number) {
    a = !isNaN(a) && typeof a !== 'boolean' ? +a : 0;
    b = !isNaN(b) && typeof b !== 'boolean' ? +b : 0;
    return (a - b);
  }

  //Convertir valores
  numeros(a: any) {
    a = !isNaN(a) && typeof a !== 'boolean' ? +a : 0;
    return (a);
  }

  // Percentage
  percent(a: any) {
    a = !isNaN(a) && typeof a !== 'boolean' ? +a : 0;
    if (a === 1) { a = 19 }
    return Intl.NumberFormat("en-US", { style: "percent", }).format(a / 100);
  }

  calcularImpuesto(a: any, b: any, c: any, d: any) {
    a = !isNaN(a) && typeof a !== 'boolean' ? +a : 0;
    b = !isNaN(b) && typeof b !== 'boolean' ? +b : 0;
    c = !isNaN(c) && typeof c !== 'boolean' ? +c : 0;
    d = !isNaN(d) && typeof d !== 'boolean' ? +d : 0;
    d = d !== 0 ? d / 100 : 1
    let valorXcantidad = a * b;
    let descuento = c !== 0 ? valorXcantidad * (c / 100) : 0
    let subtotal = +valorXcantidad - descuento;
    let valorImpuesto = d !== 1 ? subtotal * d : 0;
    valorImpuesto = Number(valorImpuesto.toFixed(0))
    return valorImpuesto;
  }

  calcularDescuento(a: any, b: any, c:any) {
    a = !isNaN(a) && typeof a !== 'boolean' ? +a : 0;
    b = !isNaN(b) && typeof b !== 'boolean' ? +b : 0;
    c = !isNaN(c) && typeof b !== 'boolean' ? +c : 0;
    let valorXcantidad = a * b;
    let descuento = c !== 0 ? valorXcantidad * (c / 100) : 0
    descuento = Number(descuento.toFixed(0));
    return descuento;
  }

  calcularDescuentoMayoreoInterno(a: any, b: any) {
    a = !isNaN(a) && typeof a !== 'boolean' ? +a : 0;
    b = !isNaN(b) && typeof b !== 'boolean' ? +b : 0;
    let descuento = a - b;
    descuento = Number(descuento.toFixed(0));
    return descuento;
  }

  calculartotal(a: any, b: any) {
    a = !isNaN(a) && typeof a !== 'boolean' ? +a : 0;
    b = !isNaN(b) && typeof b !== 'boolean' ? +b : 0;
    b = b !== 0 ? b / 100 : 1
    let valorImpuesto = b !== 1 ? a * b : 0
    let total = a + valorImpuesto
    total = Number(total.toFixed(2));
    return total;
  }

  calcularSubtotal(a: any, b: any, c?: any) {
    a = !isNaN(a) && typeof a !== 'boolean' ? +a : 0;
    b = !isNaN(b) && typeof b !== 'boolean' ? +b : 0;
    c = !isNaN(c) && typeof c !== 'boolean' ? +c : 0;
    let valorXcantidad = a * b;
    let descuento = c !== 0 ? valorXcantidad * (c / 100) : 0
    let subtotal = +valorXcantidad - descuento;
    subtotal = Number(subtotal.toFixed(0));
    return subtotal;
  }

  calcularUnitario(a: any, b: any) {
    a = !isNaN(a) && typeof a !== 'boolean' ? +a : 0;
    b = !isNaN(b) && typeof b !== 'boolean' ? +b : 0;
    let descuentoIva = a / ((b / 100) + 1);
    descuentoIva = Number(descuentoIva.toFixed(0));
    return descuentoIva;
  }

  calcularInterno(a: any, b: any) {
    a = !isNaN(a) && typeof a !== 'boolean' ? +a : 0;
    b = !isNaN(b) && typeof b !== 'boolean' ? +b : 0;
    let precioInterno = a + ((b / 100)* a);
    precioInterno = Number(precioInterno.toFixed(0));
    return precioInterno;
  }

}
