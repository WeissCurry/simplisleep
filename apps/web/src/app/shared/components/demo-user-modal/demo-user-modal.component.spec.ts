import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DemoUserModalComponent } from './demo-user-modal.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { DUMMY_SIMPLIMATES } from '../../../core/services/mock-data';

describe('DemoUserModalComponent', () => {
  let fixture: ComponentFixture<DemoUserModalComponent>;
  let component: DemoUserModalComponent;
  let authService: AuthService;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoUserModalComponent],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(DemoUserModalComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    toastService = TestBed.inject(ToastService);
  });

  it('harus membuat komponen dengan baik', () => {
    expect(component).toBeTruthy();
  });

  it('harus memuat tepat 3 akun demo saat dibuka', () => {
    vi.spyOn(authService, 'getDemoUsers').mockReturnValue(of(DUMMY_SIMPLIMATES));
    component.isOpen = true;
    component.ngOnChanges({
      isOpen: {
        currentValue: true,
        previousValue: false,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.users().length).toBe(3);
  });

  it('harus memanggil auth.loginDemo dan toast.success saat user dipilih', () => {
    const mockUser = DUMMY_SIMPLIMATES[0];
    const loginSpy = vi.spyOn(authService, 'loginDemo').mockReturnValue(of({
      token: 'mock-token',
      user: mockUser
    }));
    const toastSpy = vi.spyOn(toastService, 'success');
    const emitSpy = vi.spyOn(component.userSelected, 'emit');
    const closeSpy = vi.spyOn(component.closed, 'emit');

    component.selectUser(mockUser);

    expect(loginSpy).toHaveBeenCalledWith(mockUser.id, mockUser);
    expect(toastSpy).toHaveBeenCalledWith(`Masuk sebagai ${mockUser.name}`, 'Demo Login');
    expect(emitSpy).toHaveBeenCalledWith(mockUser);
    expect(closeSpy).toHaveBeenCalled();
  });

  it('harus menampilkan toast.error saat login demo gagal', () => {
    const mockUser = DUMMY_SIMPLIMATES[0];
    vi.spyOn(authService, 'loginDemo').mockReturnValue(
      throwError(() => ({ error: { error: 'Akses ditolak' } }))
    );
    const toastSpy = vi.spyOn(toastService, 'error');

    component.selectUser(mockUser);

    expect(toastSpy).toHaveBeenCalledWith('Akses ditolak', 'Demo Login');
  });

  it('harus menutup modal saat tombol escape ditekan', () => {
    component.isOpen = true;
    const closeSpy = vi.spyOn(component.closed, 'emit');
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    vi.spyOn(event, 'preventDefault');

    component.onEscapeKey(event);

    expect(closeSpy).toHaveBeenCalled();
  });
});
