import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { SearchModalComponent } from '../search-modal/search-modal.component';

@Component({
  selector: 'app-shared-header',
  templateUrl: './shared-header.component.html',
  styleUrls: ['./shared-header.component.scss'],
})
export class SharedHeaderComponent  implements OnInit {

 constructor(private modalCtrl: ModalController) {}

 async abrirBuscador() {
  const modal = await this.modalCtrl.create({
    component: SearchModalComponent,
    initialBreakpoint: 0.5,
    breakpoints: [0, 0.5, 0.8]
  });
  return await modal.present();
}
  ngOnInit() {}

}
