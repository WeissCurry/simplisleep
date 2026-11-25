import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '../../app.routes';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { LeaderboardService } from '../../core/services/leaderboard.service';
import { ToastService } from '../../core/services/toast.service';
import { LeaderboardComponent } from './leaderboard.component';
import { TransparencyService } from '../transparency/transparency.service';

describe('LeaderboardComponent', () => {
  let component: LeaderboardComponent;
  let fixture: ComponentFixture<LeaderboardComponent>;
  let toastService: ToastService;
  let router: Router;
  const originalUseMock = environment.useMock;

  beforeEach(async () => {
    localStorage.clear();
    (environment as any).useMock = true;

    await TestBed.configureTestingModule({
      imports: [LeaderboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(routes),
        AuthService,
        LeaderboardService,
        TransparencyService,
        ToastService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LeaderboardComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    (environment as any).useMock = originalUseMock;
    localStorage.clear();
    toastService.clear();
    document.body.style.overflow = '';
  });

  it('dapat membuat komponen leaderboard dan memuat data default 2026-W47', () => {
    expect(component).toBeTruthy();
    expect(component.selectedWeek()).toBe('2026-W47');
    expect(component.leaderboardData()).not.toBeNull();
    expect(component.topThree().length).toBe(3);
    expect(component.transparencyRecords().length).toBeGreaterThan(0);
  });

  it('menampilkan status pending secara default untuk minggu aktif 2026-W47', () => {
    expect(component.currentWeekCommitStatus()).toBe('pending');
    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('button[aria-label*="Menunggu verifikasi"]');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain('Menunggu verifikasi');
  });

  it('mengubah minggu ke 2026-W46 memperbarui status menjadi committed dan badge terverifikasi', () => {
    const select = fixture.nativeElement.querySelector('#week-select') as HTMLSelectElement;
    select.value = '2026-W46';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.selectedWeek()).toBe('2026-W46');
    expect(component.currentWeekCommitStatus()).toBe('committed');

    const badge = fixture.nativeElement.querySelector('button[aria-label*="Terverifikasi"]');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain('Terverifikasi');
  });

  it('membuka popup verifikasi on-chain: state terbuka, body overflow terkunci, dialog muncul', () => {
    expect(component.isVerificationPopupOpen()).toBe(false);
    expect(document.body.style.overflow).not.toBe('hidden');

    component.openVerificationPopup();
    fixture.detectChanges();

    expect(component.isVerificationPopupOpen()).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog?.textContent).toContain('Verifikasi Catatan');
  });

  it('menutup popup verifikasi on-chain: tombol tutup dan esc mengembalikan overflow body', () => {
    component.openVerificationPopup();
    fixture.detectChanges();
    expect(component.isVerificationPopupOpen()).toBe(true);

    component.closeVerificationPopup();
    fixture.detectChanges();

    expect(component.isVerificationPopupOpen()).toBe(false);
    expect(document.body.style.overflow).toBe('');

    // Buka lagi lalu tutup dengan Esc
    component.openVerificationPopup();
    fixture.detectChanges();
    expect(component.isVerificationPopupOpen()).toBe(true);

    const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    component.onEscapeKey(escEvent);
    fixture.detectChanges();

    expect(component.isVerificationPopupOpen()).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('menutup popup saat backdrop diklik', () => {
    component.openVerificationPopup();
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('[role="presentation"]');
    expect(backdrop).toBeTruthy();

    const mockEvent = {
      target: backdrop,
      currentTarget: backdrop
    } as unknown as MouseEvent;

    component.onBackdropClick(mockEvent);
    fixture.detectChanges();

    expect(component.isVerificationPopupOpen()).toBe(false);
  });

  it('menjalankan verifikasi keccak on-chain pada minggu committed menghasilkan kecocokan inline tanpa duplikasi toast sukses', async () => {
    const successSpy = vi.spyOn(toastService, 'success');
    const errorSpy = vi.spyOn(toastService, 'error');

    // Set minggu committed via dropdown change agar data minggu 2026-W46 dimuat
    const select = fixture.nativeElement.querySelector('#week-select') as HTMLSelectElement;
    select.value = '2026-W46';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    component.openVerificationPopup();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    // Kalimat penjelasan awam harus ada di modal
    expect(compiled.textContent).toContain('Skor minggu ini tercatat permanen');

    component.verifyCurrentWeek();
    expect(component.isVerifyingHash()).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 450));
    fixture.detectChanges();

    expect(component.isVerifyingHash()).toBe(false);
    const result = component.verificationResult();
    expect(result).not.toBeNull();
    expect(result?.isMatch).toBe(true);

    // Hasil sudah tampil inline di modal, tidak menduplikasi toast sukses
    expect(successSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('menampilkan toast error jika verifikasi hash tidak cocok', async () => {
    const errorSpy = vi.spyOn(toastService, 'error');

    component.selectedWeek.set('2026-W45');
    // Set record dengan hash yang tidak cocok
    component.transparencyRecords.set([
      {
        week: '2026-W45',
        hash: '0xinvalidhash99999999999999999999999999999999999999999999999999999999',
        txHash: '0xtx123',
        chainId: 11155111,
        committedAt: '2026-11-09T00:00:00.000Z',
        blockNumber: 1234,
        contractAddress: '0xcontract',
        status: 'committed'
      }
    ]);

    component.openVerificationPopup();
    fixture.detectChanges();

    // Verifikasi minggu dengan hash yang tidak cocok
    // Temporarily override keccakLeaderboard check untuk test case mismatch
    component.verifyCurrentWeek();
    await new Promise((resolve) => setTimeout(resolve, 450));
    fixture.detectChanges();

    const result = component.verificationResult();
    expect(result).not.toBeNull();
    expect(result?.isMatch).toBe(false);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('tidak cocok dengan sistem pencatatan publik'),
      'Verifikasi Gagal'
    );
  });

  it('memotong hash panjang dengan formatTruncatedHash', () => {
    const fullHash = '0x7e8b23a9d18c04e28741369ef995bca2034918e7d23a19f993bcde448821019a';
    const truncated = component.formatTruncatedHash(fullHash);
    expect(truncated).toBe('0x7e8b23...21019a');
    expect(component.formatTruncatedHash('')).toBe('');
    expect(component.formatTruncatedHash('short')).toBe('short');
  });

  it('menyalin hash ke clipboard dan memanggil toast success', () => {
    const toastSpy = vi.spyOn(toastService, 'success');
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextSpy
      }
    });

    component.copyHash('0xabc123');
    expect(writeTextSpy).toHaveBeenCalledWith('0xabc123');
    expect(toastSpy).toHaveBeenCalledWith(
      'Kode verifikasi telah disalin!',
      'Salin Kode'
    );
  });

  it('route /transparency melakukan redirect ke /leaderboard', async () => {
    // Navigasi ke /transparency
    await router.navigateByUrl('/transparency');
    expect(router.url).toBe('/leaderboard');
  });
});
