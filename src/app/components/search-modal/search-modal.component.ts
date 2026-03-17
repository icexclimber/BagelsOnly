import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.scss'],
})
export class SearchModalComponent  implements OnInit {

 constructor(private modalCtrl: ModalController) {}
cerrar() { this.modalCtrl.dismiss(); }

  ngOnInit() {}

}
