import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { CardsComponent } from './cards.component';
import { CardDetailModalComponent } from './card-detail-modal.component';
import { CardsService, ALL_28_CARDS } from './cards.service';
import { ToastService } from '../../core/services/toast.service';
import { AnimationService } from '../../core/utils/animation.service';
import { environment } from '../../../environments/environment';
import { describe, expect, it, beforeEach, vi } from 'vitest';

describe('CardsComponent Web2 Terminology', () => {
  let fixture: ComponentFixture<CardsComponent>;
  let component: CardsComponent;

  beforeEach(async () => {
    environment.useMock = true;
    await TestBed.configureTestingModule({
      imports: [CardsComponent],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render header with Web2 copy instead of Web3 terms', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const lead = compiled.querySelector('.lead-pixel')?.textContent || '';
    expect(lead).toContain('Setiap kartu disimpan permanen sebagai kartu koleksi.');
    expect(lead).not.toContain('NFT');
    expect(lead).not.toContain('Soulbound');
    expect(lead).not.toContain('ERC-5192');
    expect(lead).not.toContain('di-mint');
  });

  it('should display "✓ Tersimpan" badge instead of "✓ Minted"', () => {
    component.ownedCards = [
      { ...ALL_28_CARDS[0], status: 'minted' } as any
    ];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent || '';
    expect(text).toContain('✓ Tersimpan');
    expect(text).not.toContain('✓ Minted');
  });
});

describe('CardDetailModalComponent Web2 Terminology', () => {
  let fixture: ComponentFixture<CardDetailModalComponent>;
  let component: CardDetailModalComponent;
  let toastService: ToastService;
  let animService: AnimationService;

  beforeEach(async () => {
    environment.useMock = true;
    await TestBed.configureTestingModule({
      imports: [CardDetailModalComponent],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(CardDetailModalComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    animService = TestBed.inject(AnimationService);

    component.card = {
      ...ALL_28_CARDS[0],
      status: 'minted',
      tokenId: 201,
      txHash: '0x3f58a74e908b9821de837264aefc90226b87201c89320857321ff8b2c4e1a0b3'
    } as any;
    component.isUnlocked = true;
    fixture.detectChanges();
  });

  it('should display Web2 terms in modal title and badges', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('#card-modal-title')?.textContent || '';
    expect(title).toContain('Detail Kartu Koleksi');
    expect(title).not.toContain('Soulbound');

    const text = compiled.textContent || '';
    expect(text).toContain('✓ Tersimpan');
    expect(text).toContain('Sistem Pencatatan:');
    expect(text).toContain('Status Catatan:');
    expect(text).toContain('Catatan Publik');
    expect(text).toContain('No. Kartu:');
    expect(text).toContain('Kode Verifikasi:');
    expect(text).toContain('Lihat Catatan Publik');

    // Negative assertions for Web3 jargon in visible text
    expect(text).not.toContain('ERC-5192');
    expect(text).not.toContain('NFT');
    expect(text).not.toContain('Ethereum Sepolia Testnet');
    expect(text).not.toContain('Bukti On-Chain:');
    expect(text).not.toContain('Lihat Etherscan');
    expect(text).not.toContain('Token ID:');
  });

  it('should display Web2 message in toast notifications', () => {
    const successSpy = vi.spyOn(toastService, 'success');
    const warningSpy = vi.spyOn(toastService, 'warning');
    const infoSpy = vi.spyOn(toastService, 'info');
    vi.spyOn(animService, 'isReducedMotion').mockReturnValue(true);

    // Minted status toast
    component.showStatusToast();
    expect(successSpy).toHaveBeenCalledWith(
      expect.stringContaining('telah disimpan permanen di catatan publik.'),
      'Kartu Tersimpan'
    );

    // Pending-mint status toast
    component.card = { ...component.card, status: 'pending-mint' };
    component.showStatusToast();
    expect(warningSpy).toHaveBeenCalledWith(
      expect.stringContaining('Akan otomatis diamankan ke catatan publik saat server terhubung.'),
      'Sedang Disimpan'
    );

    // Flip card: no passive toast, retains Web2 terminology on card back
    component.toggleFlip();
    expect(component.isFlipped).toBe(true);
    expect(infoSpy).not.toHaveBeenCalled();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent || '';
    expect(text).toContain('Kartu Koleksi Permanen');
    expect(text).not.toContain('Soulbound');
    expect(text).not.toContain('NFT');
  });
});
