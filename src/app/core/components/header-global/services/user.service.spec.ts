import { TestBed } from '@angular/core/testing';
// En src/app/core/services/user.service.spec.ts
import { UserService } from './core/services/user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debe tener datos iniciales del usuario', (done) => {
    service.user$.subscribe(user => {
      expect(user.nombre).toBe('Tu Nombre');
      expect(user.nivel).toBe('4.5');
      done(); // Necesario para pruebas con Observables
    });
  });

  it('debe actualizar la foto correctamente', (done) => {
    const nuevaFoto = 'https://nueva-foto.png';
    service.updateFoto(nuevaFoto);
    
    service.user$.subscribe(user => {
      expect(user.foto).toBe(nuevaFoto);
      done();
    });
  });
});