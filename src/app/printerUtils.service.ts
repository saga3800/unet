import { Injectable,Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PrinterUtilsService {


  
  constructor(private currencyPipe: CurrencyPipe) { }

  usbDevice: any = [];
  //dataSourceSales: any = [];

  async connectToPrinter(value: boolean, dataSourceSales: any = []) {
    try {
      this.usbDevice = await (navigator as any).usb.getDevices()
      if (this.usbDevice.length > 0) {
        this.usbDevice.forEach((value: any, index: number) => {
          //Por el momento nombre de la impresora quemados en codigo si tiene mas de 1 dispositivo vinculado
          if (value.productName === "TM-T88V") {
            this.usbDevice = value;
            return;
          }
        });
      };
      if (this.usbDevice.length !== undefined) {
        this.usbDevice = await (navigator as any).usb.requestDevice({ filters: [{ productName: 'TM-T88V' }] })
        if (this.usbDevice.length > 1) {
          this.usbDevice.forEach((value: any, index: number) => {
            //Por el momento nombre de la impresora quemados en codigo si tiene mas de 1 dispositivo vinculado
            if (value.productName === "TM-T88V") {
              this.usbDevice = value;
              return;
            }
          });
        };
      };
      this.sendToPrinter(value, dataSourceSales);
    } catch (error) {
      console.error('Error conectando dispositivo USB:', error);
    }
  };

  async sendToPrinter(value: boolean, dataSourceSales: any = []) {
    try {
      if (this.usbDevice) {
        if (!value) {
          await this.usbDevice.open()
            .then(() => this.usbDevice.selectConfiguration(1))
            .then(() => this.usbDevice.claimInterface(this.usbDevice.configuration.interfaces[0]?.interfaceNumber))
          const cmd = ['\x10' + '\x14' + '\x01' + '\x00' + '\x05'];
          await this.usbDevice.transferOut(
            this.usbDevice.configuration.interfaces[0]?.alternate.endpoints.find((obj: any) => obj.direction === 'out').endpointNumber,
            new Uint8Array(
              new TextEncoder().encode(cmd.join())
            )
          );
        } else if (!dataSourceSales.devolucion){
          await this.usbDevice.open()
            .then(() => this.usbDevice.selectConfiguration(1))
            .then(() => this.usbDevice.claimInterface(this.usbDevice.configuration.interfaces[0]?.interfaceNumber))
          const encabezado =
            [
              '\x1B' + '\x40' +      // init
              '\x1b' + '\x21' + '\x01' + // Select Font B
              '\x1B' + '\x61' + '\x01' + // Center align
              '\x1B' + '\x45' + '\x0D' + //Bold ON
              'PAPELERIA PUNTO U' + '\x0a' +
              '\x1B' + '\x45' + '\x0A' + // Bold OFF
              'Calle 67 # 55 - 83' + '\x0a' +
              'Medellin,Antioquia' + '\x0a' +
              'ppuntou@hotmail.com' + '\x0a' +
              'Telefono: 300 8002603' + '\x0a' +
              '--------------------------------------------------------' + '\x0a' +
              '\x1b' + '\x61' + '\x00' + // Left align
              'Fecha      :' + dataSourceSales.fechaFactura.substr(0, 19) + '\x0a' +
              'Remision   :' + dataSourceSales.numeroFactura + '\x0a' +
              'Vencimiento:' + dataSourceSales.fechaVencimiento + '\x0a' +
              'Cliente    :' + dataSourceSales.cliente.nombreRazonSocial + '\x0a' +
              'Documento  :' + dataSourceSales.cliente.numeroDocumento + '\x0a' +
              '--------------------------------------------------------' + '\x0a' +
              '\x1B' + '\x45' + '\x0D' + //Bold ON
              '\x1b' + '\x61' + '\x10' + // Left align
              'Descripcion         ' + '\x09' + 'V.Uni' + '\x09' + 'Cant' + '\x09' + 'Total' + '\x0a' +
              '\x1B' + '\x45' + '\x0A' + // Bold OFF
              '\x1B' + '\x61' + '\x00' + // Left align
              '--------------------------------------------------------' + '\x0a'
            ];
          await this.usbDevice.transferOut(
            this.usbDevice.configuration.interfaces[0]?.alternate.endpoints.find((obj: any) => obj.direction === 'out').endpointNumber,
            new Uint8Array(
              new TextEncoder().encode(encabezado.join())
            )
          );
          //Productos
          for (let i = 0; i < dataSourceSales.articulo.length; i++) {
            let marca = dataSourceSales.articulo[i].descuento > 0 ? '*' : '';
            const productos =
              [
                dataSourceSales.articulo[i].descripcion.substr(0, 20) + '\x09' +
                dataSourceSales.articulo[i].precioVenta + '\x09' +
                dataSourceSales.articulo[i].cantidad + '\x09' +
                dataSourceSales.articulo[i].total +
                '\x1B' + '\x45' + '\x0D' + //Bold ON
                marca +
                '\x1B' + '\x45' + '\x0A' + // Bold OFF
                '\x0a'
              ];
            await this.usbDevice.transferOut(
              this.usbDevice.configuration.interfaces[0]?.alternate.endpoints.find((obj: any) => obj.direction === 'out').endpointNumber,
              new Uint8Array(
                new TextEncoder().encode(productos.join())
              )
            );
          }
          const totales =
            [
              '--------------------------------------------------------' + '\x0a' +
              '\x1b' + '\x21' + '\x00' + // Select Font A
              '\x1B' + '\x45' + '\x0D' + //Bold ON
              '\x1b' + '\x61' + '\x00' + // Left align
              '\x09' + 'Subtotal :' + '\x09' + this.currencyPipe.transform(dataSourceSales.subtotal, 'USD', 'symbol', '1.0-0') + '\x0a' +
              '\x09' + 'Descuento:' + '\x09' + this.currencyPipe.transform(dataSourceSales.descuento, 'USD', 'symbol', '1.0-0') + '\x0a' +
              '\x09' + 'Total    :' + '\x09' + this.currencyPipe.transform(dataSourceSales.total, 'USD', 'symbol', '1.0-0') + '\x0a' +
              '\x1B' + '\x61' + '\x01' + // Center align
              '\x1B' + '\x45' + '\x0A' + // Bold OFF
              '\x1b' + '\x21' + '\x01' + // Select Font B
              '--------------------------------------------------------' + '\x0a' +
              '\x1b' + '\x61' + '\x00' + // Left align
              'Forma de Pago  :' + dataSourceSales.formaDePago + '\x0a' +
              'Vendedor       :' + dataSourceSales.vendedor + '\x0a' +
              '\x1B' + '\x61' + '\x01' + // Center align
              '--------------------------------------------------------' + '\x0a' +
              '\x1B' + '\x45' + '\x0D' + //Bold ON
              'Gracias por su compra!' + '\x0a' +
              '\x0a' + '\x0a' + '\x0a' + '\x0a' + '\x0a' +
              '\x10' + '\x14' + '\x01' + '\x00' + '\x05' +
              '\x1D' + '\x56' + '\x01'
            ];
          await this.usbDevice.transferOut(
            this.usbDevice.configuration.interfaces[0]?.alternate.endpoints.find((obj: any) => obj.direction === 'out').endpointNumber,
            new Uint8Array(
              new TextEncoder().encode(totales.join())
            )
          );
        }else{
          await this.usbDevice.open()
          .then(() => this.usbDevice.selectConfiguration(1))
          .then(() => this.usbDevice.claimInterface(this.usbDevice.configuration.interfaces[0]?.interfaceNumber))
        const encabezado =
          [
            '\x1B' + '\x40' +      // init
            '\x1b' + '\x21' + '\x01' + // Select Font B
            '\x1B' + '\x61' + '\x01' + // Center align
            '\x1B' + '\x45' + '\x0D' + //Bold ON
            'PAPELERIA PUNTO U' + '\x0a' +
            '\x1B' + '\x45' + '\x0A' + // Bold OFF
            'Calle 67 # 55 - 83' + '\x0a' +
            'Medellin,Antioquia' + '\x0a' +
            'ppuntou@hotmail.com' + '\x0a' +
            'Telefono: 300 8002603' + '\x0a' +
            '--------------------------------------------------------' + '\x0a' +
            '\x1b' + '\x61' + '\x00' + // Left align
            'Fecha Rem :' + dataSourceSales.fechaFactura.substr(0, 19) + '\x0a' +
            'Remision  :' + dataSourceSales.numeroFactura + '\x0a' +
            'Fecha Dev :' + dataSourceSales.fechaDevolucion.substr(0, 19) + '\x0a' +
            'Devolucion:' + dataSourceSales.numeroDevolucion + '\x0a' +
            'Cliente   :' + dataSourceSales.cliente.nombreRazonSocial + '\x0a' +
            'Documento :' + dataSourceSales.cliente.numeroDocumento + '\x0a' +
            '--------------------------------------------------------' + '\x0a' +
            '\x1B' + '\x45' + '\x0D' + //Bold ON
            '\x1b' + '\x61' + '\x10' + // Left align
            'Descripcion         ' + '\x09' + 'V.Uni' + '\x09' + 'Cant' + '\x09' + 'Total' + '\x0a' +
            '\x1B' + '\x45' + '\x0A' + // Bold OFF
            '\x1B' + '\x61' + '\x00' + // Left align
            '--------------------------------------------------------' + '\x0a'
          ];
        await this.usbDevice.transferOut(
          this.usbDevice.configuration.interfaces[0]?.alternate.endpoints.find((obj: any) => obj.direction === 'out').endpointNumber,
          new Uint8Array(
            new TextEncoder().encode(encabezado.join())
          )
        );
        //Productos
        for (let i = 0; i < dataSourceSales.articulo.length; i++) {
          let marca = dataSourceSales.articulo[i].descuento > 0 ? '*' : '';
          const productos =
            [
              dataSourceSales.articulo[i].descripcion.substr(0, 20) + '\x09' +
              dataSourceSales.articulo[i].precioVenta + '\x09' +
              dataSourceSales.articulo[i].cantidad + '\x09' +
              dataSourceSales.articulo[i].total +
              '\x1B' + '\x45' + '\x0D' + //Bold ON
              marca +
              '\x1B' + '\x45' + '\x0A' + // Bold OFF
              '\x0a'
            ];
          await this.usbDevice.transferOut(
            this.usbDevice.configuration.interfaces[0]?.alternate.endpoints.find((obj: any) => obj.direction === 'out').endpointNumber,
            new Uint8Array(
              new TextEncoder().encode(productos.join())
            )
          );
        }
        const totales =
          [
            '--------------------------------------------------------' + '\x0a' +
            '\x1b' + '\x21' + '\x00' + // Select Font A
            '\x1B' + '\x45' + '\x0D' + //Bold ON
            '\x1b' + '\x61' + '\x00' + // Left align
            '\x09' + 'Subtotal :' + '\x09' + this.currencyPipe.transform(dataSourceSales.subtotal, 'USD', 'symbol', '1.0-0') + '\x0a' +
            '\x09' + 'Descuento:' + '\x09' + this.currencyPipe.transform(dataSourceSales.descuento, 'USD', 'symbol', '1.0-0') + '\x0a' +
            '\x09' + 'Total    :' + '\x09' + this.currencyPipe.transform(dataSourceSales.total, 'USD', 'symbol', '1.0-0') + '\x0a' +
            '\x1B' + '\x61' + '\x01' + // Center align
            '\x1B' + '\x45' + '\x0A' + // Bold OFF
            '\x1b' + '\x21' + '\x01' + // Select Font B
            '--------------------------------------------------------' + '\x0a' +
            '\x1b' + '\x61' + '\x00' + // Left align
            'Forma de Pago  :' + dataSourceSales.formaDePago + '\x0a' +
            'Vendedor       :' + dataSourceSales.vendedor + '\x0a' +
            '\x1B' + '\x61' + '\x01' + // Center align
            '--------------------------------------------------------' + '\x0a' +
            '\x1B' + '\x45' + '\x0D' + //Bold ON
            'Gracias por su visita!' + '\x0a' +
            '\x0a' + '\x0a' + '\x0a' + '\x0a' + '\x0a' +
            '\x10' + '\x14' + '\x01' + '\x00' + '\x05' +
            '\x1D' + '\x56' + '\x01'
          ];
        await this.usbDevice.transferOut(
          this.usbDevice.configuration.interfaces[0]?.alternate.endpoints.find((obj: any) => obj.direction === 'out').endpointNumber,
          new Uint8Array(
            new TextEncoder().encode(totales.join())
          )
        );         
        }
        await this.usbDevice.releaseInterface(0);
        this.disconnectToDevice();
      }
    } catch (error) {
      console.error("Error enviando a la impresora:", error);
    }
  };

  async disconnectToDevice() {
    try {
      if (this.usbDevice) {
        await this.usbDevice.close();
      }
    } catch (error) {
      console.error('Error disconnecting from USB device:', error);
    }
  };

}
