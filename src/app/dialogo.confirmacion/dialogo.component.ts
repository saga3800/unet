import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialogo',
  templateUrl: './dialogo.component.html',
  styleUrls: ['./dialogo.component.css']
})
export class DialogoConfirmacionComponent implements OnInit {


  constructor(
    public dialogo: MatDialogRef<DialogoConfirmacionComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string) { }

    cerrar(): void {
      this.dialogo.close(false);
    }
    confirmar(): void {
      this.dialogo.close(true);
    }

  ngOnInit() {}
  };
