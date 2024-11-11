import { Component,Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilsService } from '../utils.service';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { TokenService } from '../login/token';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-dialogo.cotizacion',
  templateUrl: './dialogo.cotizacion.component.html',
  styleUrls: ['./dialogo.cotizacion.component.css']
})
export class DialogoCotizacionComponent implements OnInit{

  @ViewChild('card', { static: true }) card: ElementRef | undefined;  
  @ViewChild('cardheader', { static: true }) cardheader: ElementRef | undefined;  
  @ViewChild('cardbody',   { static: true }) cardbody: ElementRef | undefined;  

  constructor(public dialogo: MatDialogRef<DialogoCotizacionComponent>, @Inject(MAT_DIALOG_DATA) public dataSourceSales: any = [],
    private http: HttpClient, private tokenService: TokenService, public utilsService: UtilsService, private currencyPipe: CurrencyPipe )
    {
      dialogo.disableClose = true
    }


  ngOnInit(): void {
  }

  print() {
    window.focus();
    window.print();
    this.dialogo.close(true);
  }

  printOnly() {
    window.focus();
    window.print();
    this.dialogo.close(false);
  }

  cerrar() {
    this.dialogo.close(true);
  }

  continuar() {
    this.dialogo.close(false);
  }
}