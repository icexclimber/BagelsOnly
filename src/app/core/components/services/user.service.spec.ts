import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service'; // ✅ Correcto: "búscalo aquí a mi lado" // Asegúrate de que solo importe UserService

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});