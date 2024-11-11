import { Component, HostListener, Injector, OnInit, effect, signal, untracked } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  public actividad = signal(true);

  private time: any;

  @HostListener('mousemove', ['event'])
  public enviarmouse(btn: any) {
    this.actividad.set(true);
  }

  constructor(private inject: Injector, private router: Router) { };

  title = 'Papeleria PuntoU';
  negocio: string = 'venta de materiales para cosas didacticas';
  hidden = false;
  toggleBadgeVisibility() { this.hidden = !this.hidden; }

  ngOnInit(): void {
    this.metodoInactividad();
  }

  private metodoInactividad() {
    effect(() => {
      if (this.actividad()) {
        if (this.time) {
          clearTimeout(this.time)
        }
        this.time = setTimeout(() => {
          alert("Se cerró ventana por inatividad")
          this.routerLinkLogin();
        }, 3600000);

        untracked(() => {
          this.actividad.set(false);
        });
      }
    }, { injector: this.inject });
  }

  routerLinkLogin(): void {
    this.router.navigate(['/login'])
  };
    
}
