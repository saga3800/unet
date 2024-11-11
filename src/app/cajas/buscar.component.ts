import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../login/token';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DialogoConfirmacionComponent } from "../dialogo.confirmacion/dialogo.component"

@Component({
  selector: 'app-buscarCaja',
  templateUrl: './buscar.component.html',
  styleUrls: ['./caja.component.css'],
})
export class BuscarCajaComponent {


  constructor(private router: Router, private http: HttpClient,  public tokenService: TokenService, public dialogo:MatDialog) { }


  columnas: string[] = ['nombre', 'ubicacion', 'tipoCaja', 'estadoActivo', 'accion'];

  isLoadingResults : boolean = false;
  opened: boolean = false;
  mensajeExitoso: string = '';
  mensajeFallido: string = '';


  ubicaciones: any[] = [];
  dataSourceCajas:any;


  ngOnInit() {
    this.buscarCajaAbierta();
  }

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  async buscarCajaAbierta() {
    //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2M3YzI2ZDI5NDRiMmM2MWFiZWQ5NCIsImlhdCI6MTcxMjUwNTYxMCwiZXhwIjoxNzEyNTkyMDEwfQ.qdlwQKUZJ81BKpfGWEpBNnm2N_5l4g0yZo9GedqwJ7s"
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`,
      })
    };
    try {
      this.isLoadingResults = true;
      this.http.get<any>('https://p01--node-launet2--m5lw8pzgzy2k.code.run/api/cashiers', httpOptions )
      //this.http.get<any>('http://localhost:3030/api/cashiers', httpOptions )
      .subscribe(response => {
        if (response.Status) {
          this.dataSourceCajas = new MatTableDataSource(response.Data);
        }
        this.isLoadingResults = false;
      }, error => {
        this.isLoadingResults = false;
        if (error.status === 401) {
          this.routerLinkLogin();
        }
        this.mensajeFallido = 'Error al consultar. Por favor, revisar la consola de Errores.';
        console.error('Error en la solicitud:', error);
      });      
    } catch (error) {
      this.mensajeFallido = 'Error al consultar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);     
    }

  }

  async borrar(id: string){
    //const url = `http://localhost:3030/api/cashiers/${id}`
    const url = `https://p01--node-launet2--m5lw8pzgzy2k.code.run/api/cashiers/${id}`
    const token = this.tokenService.token;
    //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2M3YzI2ZDI5NDRiMmM2MWFiZWQ5NCIsImlhdCI6MTcxMjUwNTYxMCwiZXhwIjoxNzEyNTkyMDEwfQ.qdlwQKUZJ81BKpfGWEpBNnm2N_5l4g0yZo9GedqwJ7s"
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`,
      })
    };
    this.isLoadingResults= true;
    try {
      const response = await this.http.delete(url, httpOptions).toPromise();
      this.isLoadingResults= false;
      this.mensajeExitoso = "Registro Eliminado exitosamente"
      setTimeout(() => {
        this.refreshPage();
      }, 3000);
    } catch (error) {
      this.isLoadingResults= false;
      this.mensajeFallido = 'Error al Eliminar. Por favor, revisar la consola de Errores.';
      console.error('Error en la solicitud:', error);
    }
  }


  filtrar(event: Event) {
      const filtro = (event.target as HTMLInputElement).value;
      this.dataSourceCajas.filter = filtro.trim().toLowerCase();
  } 

  mostrarDialogo(id:string): void {
    this.dialogo
      .open(DialogoConfirmacionComponent, {
        data: `Seguro deseas ELIMINARLO?`
      })
      .afterClosed()
      .subscribe((confirmar: Boolean) => {
        if (confirmar) {
          this.borrar(id)
        } else {
          //alert("No hacer nada");
        }
      });
  }

  refreshPage() {
    window.location.reload();
  }
  routerLinkLogin(): void {
    this.router.navigate(['/login'])
  };
  
}



export class Caja {
  constructor(public nombre: string, public ubicacion: string, public tipoCaja: String, public estadoActivo: boolean
              ){}
}