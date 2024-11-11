
import { Injectable, Component } from '@angular/core';
import * as XLSX from "xlsx";

@Injectable({
  providedIn: 'root'
})
export class TableUtilsService {

  exportToExcel(arr: any[], name?: string) {
    let filter: any = [];
    if (name === 'ReporteVentas') {
      arr.map((x) => {
        for (let i = 0; i < x.articulo.length; i++) {
          const filter1 = {
            NumeroFactura: x.numeroFactura,
            FechaFactura: x.fechaFactura,
            NombreCliente: x.cliente.nombreRazonSocial,
            TipoDocumento: x.cliente.tipoDocumento,
            NumeroDocumento: x.cliente.numeroDocumento,
            CorreoElectronico: x.cliente.email,
            FormaDePago: x.formaDePago,
            CantidadEfectivo: +x.cantidadEfectivo,
            CantidadTransferencia: +x.cantidadTransferencia,
            SubtotalFactura: +x.subtotal,
            DescuentoFactura: +x.descuento,
            TotalFactura: +x.total,
            FacturacionElectronica: x.facturacionElectronica,
            Vendedor: x.vendedor,
            Articulo: x.articulo[i].descripcion,
            CodigoBarras: x.articulo[i].codigoBarras,
            ImpuestoArticulo: +x.articulo[i].impuesto,
            DescuentoArticulo: +x.articulo[i].descuento,
            PrecioVenta: +x.articulo[i].precioVenta,
            TotalArticulo: +x.articulo[i].total,
            Interno: x.articulo[i].interno,
            Mayoreo: x.articulo[i].mayoreo,
          }
          filter.push(filter1)
        }
      })
    };

    if (name === 'ReporteDetalleArticulos' || name === 'ReporteCaja') {
      filter = arr;
      /**
      filter = arr.map((x) => {
        const filter1 = {
          CodigoBarras: x.articulo[0].codigoBarras,
          Descripcion: x.articulo[0].descripcion,
          Marca: x.articulo[0].marca,
          Referencia: x.articulo[0].referencia,
          Ubicacion: x.articulo[0].codigoUbicacion,
          UnidadMedida: x.articulo[0].unidadMedida,
          Stock: +x.stock,
          PrecioVenta: +x.precios[0].precioVenta,
          PrecioMayoreo: +x.precios[0].precioMayoreo,
          PrecioInterno: +x.precios[0].PrecioInterno,
        }
        return filter1;
      })
      */
    }

    if (name === 'ReporteCompras') {
      arr.map((x) => {
        for (let i = 0; i < x.articulo.length; i++) {
          const filter1 = {
            NumeroFactura: x.numeroFactura,
            FechaFactura: x.fechaFactura,
            FechaIngreso: x.fechaIngreso,
            NombreProveedor: x.proveedor.nombreRazonSocial,
            TipoDocumento: x.proveedor.tipoDocumento,
            NumeroDocumento: x.proveedor.numeroDocumento,
            Impuestofactura: +x.impuesto,
            SubtotalFactura: +x.subtotal,
            DescuentoFactura: +x.descuento,
            TotalFactura: +x.total,
            CodigoArticulo: x.articulo[i].codigo,
            CodigoBarras: x.articulo[i].codigoBarras,
            cantidad: +x.articulo[i].cantidad,
            ImpuestoArticulo: +x.articulo[i].impuestoUnitario,
            DescuentoArticulo: +x.articulo[i].descuentoUnitario,
            PrecioInterno: +x.articulo[i].precioInterno,
            PrecioMayoreo: +x.articulo[i].precioMayoreo,
            PrecioVenta: +x.articulo[i].precioVenta,
            SubtotalArticulo: +x.articulo[i].subtotalUnitario,
            TotalArticulo: +x.articulo[i].total,
          }
          filter.push(filter1)
        }
      })
    };

    let fileName = this.getFileName(name);
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(filter);
    XLSX.utils.book_append_sheet(wb, ws, name);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  getFileName(name: any) {
    let timeStamp = new Date().toISOString();
    let prefix = name || "ExportResult";
    let fileName = `${prefix}-${timeStamp}`;
    return fileName
  }

  mapDetalleArticulos(arr: any[], name?: string) {
    const filter = arr.map((x) => {
      const filter1 = {
        CodigoBarras: x.articulo[0].codigoBarras,
        Descripcion: x.articulo[0].descripcion,
        Marca: x.articulo[0].marca,
        Referencia: x.articulo[0].referencia,
        Ubicacion: x.articulo[0].codigoUbicacion,
        UnidadMedida: x.articulo[0].unidadMedida,
        Stock: +x.stock,
        PrecioCompra: +x.precios[0].valorUnitario+(x.precios[0].valorUnitario*(x.precios[0].impuestoUnitario/100)),
        PrecioVenta: +x.precios[0].precioVenta,
        PrecioMayoreo: +x.precios[0].precioMayoreo
      }
      return filter1;
    })
    return filter;
  }
}