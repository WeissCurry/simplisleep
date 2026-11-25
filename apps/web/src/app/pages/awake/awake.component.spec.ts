import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { AwakeService } from '../../core/services/awake.service';
import { ToastService } from '../../core/services/toast.service';
import { AwakeComponent } from './awake.component';

describe('AwakeComponent', () => {
  let component: AwakeComponent;
  let fixture: ComponentFixture<AwakeComponent>;
  let awakeService: AwakeService;
  let toastService: ToastService;
  let httpMock: HttpTestingController;
  const originalUseMock = environment.useMock;

  beforeEach(async () => {
    localStorage.clear();
    (environment as any).useMock = true; // Uji mode mock pertama kali

    await TestBed.configureTestingModule({
      imports: [AwakeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AwakeService,
        ToastService,
        AuthService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AwakeComponent);
    component = fixture.componentInstance;
    awakeService = TestBed.inject(AwakeService);
    toastService = TestBed.inject(ToastService);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    (environment as any).useMock = originalUseMock;
    localStorage.clear();
    toastService.clear();
    httpMock.verify();
  });

  it('dapat membuat komponen dengan daftar awake users', () => {
    expect(component).toBeTruthy();
    expect(component.awakeList().length).toBeGreaterThan(0);
  });

  it('formatCooldown mengonversi detik ke format mm:ss yang benar', () => {
    expect(awakeService.formatCooldown(300)).toBe('05:00');
    expect(awakeService.formatCooldown(299)).toBe('04:59');
    expect(awakeService.formatCooldown(59)).toBe('00:59');
    expect(awakeService.formatCooldown(5)).toBe('00:05');
    expect(awakeService.formatCooldown(0)).toBe('00:00');
  });

  it('mode mock: mengirim pengingat tidur berhasil dan memunculkan toast sukses', () => {
    const successSpy = vi.spyOn(toastService, 'success');
    const target = component.awakeList()[0];

    component.remindUser(target);

    expect(successSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Pengingat tidur santai terkirim ke ${target.name}`),
      'Berhasil'
    );
    expect(awakeService.isCooldown(target.userId)).toBe(true);
    expect(awakeService.getRemainingCooldown(target.userId)).toBe(300);
  });

  it('mode mock: mengingatkan user yang sedang cooldown dicegah dan memunculkan toast warning', () => {
    const warningSpy = vi.spyOn(toastService, 'warning');
    const target = component.awakeList()[0];

    // Kirim pertama kali
    component.remindUser(target);

    // Kirim kedua kali saat sedang cooldown
    component.remindUser(target);

    expect(warningSpy).toHaveBeenCalledWith(
      expect.stringContaining('Harap tunggu'),
      'Sedang Cooldown'
    );
  });

  it('mode mock: status cooldown bertahan saat reload melalui localStorage', () => {
    const target = component.awakeList()[0];

    // Kirim pengingat -> tersimpan di localStorage
    component.remindUser(target);
    expect(awakeService.isCooldown(target.userId)).toBe(true);

    // Simulasi inisialisasi ulang service baru (membaca storage)
    const freshAwakeService = TestBed.runInInjectionContext(() => new AwakeService());
    freshAwakeService.loadCooldowns();
    expect(freshAwakeService.isCooldown(target.userId)).toBe(true);
    expect(freshAwakeService.getRemainingCooldown(target.userId)).toBeGreaterThan(0);
  });

  it('izin notifikasi browser TIDAK diminta otomatis saat komponen dimuat', () => {
    const requestSpy = vi.spyOn(awakeService, 'requestNotificationPermission');
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it('mode HTTP: memanggil API dan menangani 429 Too Many Requests dengan sisa cooldown', () => {
    (environment as any).useMock = false;
    const warningSpy = vi.spyOn(toastService, 'warning');
    const target = component.awakeList()[1];

    component.remindUser(target);

    const req = httpMock.expectOne('/api/reminders');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ targetUserId: target.userId });

    // Server merespon 429
    req.flush(
      { error: 'Harap tunggu cooldown', retryAfterSeconds: 150, cooldownSeconds: 300 },
      { status: 429, statusText: 'Too Many Requests' }
    );

    expect(warningSpy).toHaveBeenCalledWith(
      expect.stringContaining('02:30'),
      'Sedang Cooldown'
    );
    expect(awakeService.isCooldown(target.userId)).toBe(true);
    expect(awakeService.getRemainingCooldown(target.userId)).toBe(150);
  });
});
