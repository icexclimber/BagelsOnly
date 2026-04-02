import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisTorneosPage } from './mis-torneos.page';

describe('MisTorneosPage', () => {
  let component: MisTorneosPage;
  let fixture: ComponentFixture<MisTorneosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisTorneosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
