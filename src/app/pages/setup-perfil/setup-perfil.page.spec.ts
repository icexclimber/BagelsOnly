import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetupPerfilPage } from './setup-perfil.page';

describe('SetupPerfilPage', () => {
  let component: SetupPerfilPage;
  let fixture: ComponentFixture<SetupPerfilPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupPerfilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
