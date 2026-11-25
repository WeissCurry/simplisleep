import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [ToastService]
    });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    service.clear();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
    expect(service.activeToasts().length).toBe(0);
    expect(service.queuedCount()).toBe(0);
  });

  it('should add toast with correct type, message and title', () => {
    const id = service.success('Data berhasil disimpan', 'Sukses');
    expect(id).toMatch(/^toast-\d+$/);

    const active = service.activeToasts();
    expect(active.length).toBe(1);
    expect(active[0].type).toBe('success');
    expect(active[0].message).toBe('Data berhasil disimpan');
    expect(active[0].title).toBe('Sukses');
  });

  it('should limit active toasts to maximum 2 and queue remainder', () => {
    service.info('Pesan 1');
    service.success('Pesan 2');
    service.warning('Pesan 3');
    service.error('Pesan 4');
    service.info('Pesan 5');

    // Hanya 2 yang aktif ditampilkan agar ringkas
    expect(service.activeToasts().length).toBe(2);
    expect(service.activeToasts().map((t) => t.message)).toEqual([
      'Pesan 1',
      'Pesan 2'
    ]);

    // 3 sisanya mengantre
    expect(service.queuedCount()).toBe(3);
  });

  it('should auto-dismiss toast after duration and promote queued toast', () => {
    service.info('Pesan 1'); // duration 4000ms (expires at t=4000)
    vi.advanceTimersByTime(1000);
    service.info('Pesan 2'); // duration 4000ms (expires at t=5000)
    vi.advanceTimersByTime(1000);
    service.info('Pesan 3 (Antrean)'); // queued

    expect(service.activeToasts().length).toBe(2);
    expect(service.queuedCount()).toBe(1);

    // Majukan waktu ke t=4001ms (hanya Pesan 1 yang expired)
    vi.advanceTimersByTime(2001);

    // Pesan 1 harus sudah hilang, dan Pesan 3 dipromosikan ke activeToasts
    expect(service.activeToasts().length).toBe(2);
    expect(service.activeToasts().map((t) => t.message)).toEqual([
      'Pesan 2',
      'Pesan 3 (Antrean)'
    ]);
    expect(service.queuedCount()).toBe(0);
  });

  it('should use longer duration for error toasts (~6000ms)', () => {
    service.error('Terjadi kesalahan jaringan');

    // Pada 4500ms, error toast masih aktif
    vi.advanceTimersByTime(4500);
    expect(service.activeToasts().length).toBe(1);

    // Pada 6001ms, error toast tertutup
    vi.advanceTimersByTime(1600);
    expect(service.activeToasts().length).toBe(0);
  });

  it('should manually dismiss toast and advance queue', () => {
    const id1 = service.success('Toast 1');
    service.success('Toast 2');
    service.success('Toast 3');

    expect(service.activeToasts().length).toBe(2);
    expect(service.queuedCount()).toBe(1);

    service.dismiss(id1);

    expect(service.activeToasts().length).toBe(2);
    expect(service.activeToasts().map((t) => t.message)).toEqual([
      'Toast 2',
      'Toast 3'
    ]);
    expect(service.queuedCount()).toBe(0);
  });

  it('should clear all toasts and timers on clear()', () => {
    service.success('A');
    service.warning('B');
    service.error('C');
    service.info('D');

    service.clear();

    expect(service.activeToasts().length).toBe(0);
    expect(service.queuedCount()).toBe(0);
  });

  it('should deduplicate identical toasts that are already active or queued', () => {
    const id1 = service.error('Gagal memuat profil demo dari server.', 'Koneksi Error');
    const id2 = service.error('Gagal memuat profil demo dari server.', 'Koneksi Error');

    expect(id1).toBe(id2);
    expect(service.activeToasts().length).toBe(1);
    expect(service.queuedCount()).toBe(0);
  });
});
