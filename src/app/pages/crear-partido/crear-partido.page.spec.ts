import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearPartidoPage } from './crear-partido.page';

describe('CrearPartidoPage', () => {
  let component: CrearPartidoPage;
  let fixture: ComponentFixture<CrearPartidoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearPartidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
