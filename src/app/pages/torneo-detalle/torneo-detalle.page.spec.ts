import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TorneoDetallePage } from './torneo-detalle.page';

describe('TorneoDetallePage', () => {
  let component: TorneoDetallePage;
  let fixture: ComponentFixture<TorneoDetallePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TorneoDetallePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
