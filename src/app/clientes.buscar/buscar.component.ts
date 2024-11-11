import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../login/token';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DialogoConfirmacionComponent } from "../dialogo.confirmacion/dialogo.component"

@Component({
  selector: 'app-buscarCliente',
  templateUrl: './buscar.component.html',
  styleUrls: ['./buscar.component.css'],
})
export class buscarClienteComponent {


  constructor(private router: Router, private http: HttpClient,  public tokenService: TokenService, public dialogo:MatDialog) { }


  columnas: string[] = ['nombreRazonSocial', 'tipoDocumento', 'numeroDocumento', 'telefono','email', 'direccion' , 'departamento' , 'municipio','barrio', 'tipoCliente', 'accion'];

  pageEvent!: PageEvent;
  pageIndex:number = 0;
  pageSize !:number;
  length!:number;
  pageSizeOptions = [14];
  isLoadingResults : boolean = false;
  opened: boolean = false;
  mensajeExitoso: string = '';
  mensajeFallido: string = '';


  ubicaciones: any[] = [];
  dataSourceClientes:any;


  ngOnInit() {
    this.buscarCliente();
  }

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  async buscarCliente() {
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`,
      })
    };
    try {
      this.isLoadingResults = true;
      this.http.get<any>('https://p02--node-launet--m5lw8pzgzy2k.code.run/api/customers', httpOptions )
      .subscribe(response => {
        if (response.Status) {
          this.dataSourceClientes = new MatTableDataSource(response.Data.docs);
          this.dataSourceClientes.paginator = this.paginator;
          this.pageSize=response.Data.docs.limit;
          this.pageIndex=response.Data.docs.page;
          this.length = response.Data.totalDocs;
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

  async recargarCliente(page: PageEvent) {
    this.dataSourceClientes = new MatTableDataSource;
    const token = this.tokenService.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': `${token}`,
      })
    };
    try {
      this.isLoadingResults = true;
      this.http.get<any>(`https://p02--node-launet--m5lw8pzgzy2k.code.run/api/customers?page=${this.paginator.pageIndex + 1}&limit=${this.paginator.pageSize}`, httpOptions )
      .subscribe(response => {
        if (response.Status) {
          this.dataSourceClientes = new MatTableDataSource(response.Data.docs);
          this.pageIndex=response.Data.docs.page;
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
    const url = `https://p02--node-launet--m5lw8pzgzy2k.code.run/api/customers/${id}`
    const token = this.tokenService.token;
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
      this.dataSourceClientes.filter = filtro.trim().toLowerCase();
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



export class Cliente {
  constructor(public nombreRazonSocial: string, public tipoDocumento: string, public numeroDocumento: String,
              public telefono: string, public extension: string, public email: string,public tipoCliente: String, 
              public direccion: String, public departamento: String,public municipio: String,public barrio: String,
              public estadoActivo: boolean
              ){}
}