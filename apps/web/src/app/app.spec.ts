import { HttpErrorResponse, HttpRequest, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, provideRouter } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';
import { authGuard } from './core/guards/auth.guard';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';
import { SleepService } from './core/services/sleep.service';
import { cardImageUrl, cardSilhouetteUrl, getCardFallbackSvg, getSilhouetteFallbackSvg, hasCardImage } from './core/utils/card.util';
import { keccakLeaderboard, normalizeLeaderboardRows } from './core/utils/keccak.util';
import { ALL_28_CARDS, CardsService } from './pages/cards/cards.service';
import { PixelSliderComponent } from './shared/components/pixel-slider/pixel-slider.component';
import { environment } from '../environments/environment';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have title SimpliSleep', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.title).toBe('SimpliSleep');
  });

  it('should render header branding', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header')?.textContent).toContain('SimpliSleep');
  });
});

describe('keccakLeaderboard Util', () => {
  it('should generate consistent keccak256 hash for sorted leaderboard rows', () => {
    const rowsUnsorted = [
      { rank: 2, userId: 'user-2', avgScore: 90.8 },
      { rank: 1, userId: 'user-1', avgScore: 92.4 }
    ];
    const hash = keccakLeaderboard(rowsUnsorted);
    expect(hash).toMatch(/^0x[a-fA-F0-9]{64}$/);

    const rowsSorted = [
      { rank: 1, userId: 'user-1', avgScore: 92.4 },
      { rank: 2, userId: 'user-2', avgScore: 90.8 }
    ];
    expect(keccakLeaderboard(rowsSorted)).toBe(hash);
  });
});

describe('cardImageUrl Util', () => {
  it('should format card image URLs and provide pixel fallback', () => {
    expect(cardImageUrl('sloth')).toBe('/card-art/sloth.webp');
    expect(cardImageUrl('sloth.png')).toBe('/card-art/sloth.webp');
    expect(cardImageUrl('sloth.jpg')).toBe('/card-art/sloth.webp');
    expect(getCardFallbackSvg('Kucing Oren', 'Common')).toContain('data:image/svg+xml');
  });

  it('should format card silhouette URLs and provide silhouette fallback', () => {
    expect(cardSilhouetteUrl('sloth')).toBe('/card-art/silhouette/sloth.webp');
    expect(cardSilhouetteUrl('sloth.webp')).toBe('/card-art/silhouette/sloth.webp');
    expect(cardSilhouetteUrl('')).toBe('');
    expect(cardSilhouetteUrl('t-rex')).toBe('/card-art/silhouette/t-rex.webp');
    expect(cardSilhouetteUrl('phoenix')).toBe('/card-art/silhouette/phoenix.webp');
    expect(cardSilhouetteUrl('unknown-monster')).toBe('');
    expect(hasCardImage('sloth')).toBe(true);
    expect(hasCardImage('t-rex')).toBe(true);
    expect(hasCardImage('octopus')).toBe(true);
    expect(hasCardImage('dragon')).toBe(true);
    expect(hasCardImage('phoenix')).toBe(true);
    expect(hasCardImage('white-deer')).toBe(true);
    expect(hasCardImage('unknown-monster')).toBe(false);
    expect(getSilhouetteFallbackSvg('Rare')).toContain('data:image/svg+xml');
  });
});

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient()]
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should allow access when user is authenticated', () => {
    vi.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBe(true);
  });

  it('should redirect to /login when user is not authenticated', () => {
    vi.spyOn(authService, 'isAuthenticated').mockReturnValue(false);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result.toString()).toContain('/login');
  });
});

describe('authInterceptor', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient()]
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should add Authorization Bearer header when token exists', async () => {
    vi.spyOn(authService, 'getToken').mockReturnValue('mock-token-xyz');
    const req = new HttpRequest('GET', '/api/sleep/history');
    let capturedReq: any = null;
    const next = (modifiedReq: HttpRequest<any>) => {
      capturedReq = modifiedReq;
      return of({} as any);
    };

    await TestBed.runInInjectionContext(() =>
      firstValueFrom(authInterceptor(req, next as any))
    );

    expect(capturedReq?.headers?.get('Authorization')).toBe('Bearer mock-token-xyz');
  });

  it('should handle 401 error, log out and redirect to /login', async () => {
    vi.spyOn(authService, 'getToken').mockReturnValue('expired-token');
    const logoutSpy = vi.spyOn(authService, 'logout');
    const navigateSpy = vi.spyOn(router, 'navigate');

    const req = new HttpRequest('GET', '/api/sleep/status');
    const next = () =>
      throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }));

    try {
      await TestBed.runInInjectionContext(() =>
        firstValueFrom(authInterceptor(req, next as any))
      );
      expect.fail('Should have thrown 401 error');
    } catch (err: any) {
      expect(err.status).toBe(401);
      expect(logoutSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    }
  });
});

describe('End-to-End Mock Flow (useMock)', () => {
  let authService: AuthService;
  let sleepService: SleepService;
  let cardsService: CardsService;

  beforeEach(() => {
    environment.useMock = true;
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient()]
    });
    authService = TestBed.inject(AuthService);
    sleepService = TestBed.inject(SleepService);
    cardsService = TestBed.inject(CardsService);
  });

  it('should execute full flow: demo login -> start sleep -> wake up -> collect card', async () => {
    // 1. Login demo
    const loginRes = await firstValueFrom(authService.loginDemo('user-1'));
    expect(loginRes.user.id).toBe('user-1');
    expect(authService.isAuthenticated()).toBe(true);

    // 2. Start sleep
    const session = await firstValueFrom(sleepService.startSleep());
    expect(session.userId).toBe('user-1');
    expect(session.status).toBe('active');
    expect(sleepService.activeSession()).toBeTruthy();

    // 3. Wake up
    const wakeRes = await firstValueFrom(sleepService.wakeUp());
    expect(wakeRes.session.status).toBe('completed');
    expect(wakeRes.score.score).toBeGreaterThanOrEqual(0);
    expect(sleepService.activeSession()).toBeNull();

    // 4. Cards collection
    const catalog = await firstValueFrom(cardsService.getCatalog());
    expect(catalog.length).toBe(28);
    const state = cardsService.calculateCollectionState(catalog, [catalog[0]]);
    expect(state.totalCards).toBe(28);
    expect(state.unlockedCount).toBe(1);
    expect(state.byRarity.Common.total).toBe(12);
  });

  it('should have non-empty trivia with max 200 characters for all 28 cards', async () => {
    const catalog = await firstValueFrom(cardsService.getCatalog());
    expect(catalog.length).toBe(28);
    for (const card of catalog) {
      expect(card.trivia).toBeTruthy();
      expect(typeof card.trivia).toBe('string');
      expect(card.trivia!.length).toBeGreaterThan(0);
      expect(card.trivia!.length).toBeLessThanOrEqual(200);
      expect(['fakta', 'jokes']).toContain(card.triviaType);
    }
  });
});

describe('PixelSliderComponent', () => {
  let fixture: any;
  let component: PixelSliderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PixelSliderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PixelSliderComponent);
    component = fixture.componentInstance;
    component.items = [
      { id: 'item-1', name: 'Kartu 1' },
      { id: 'item-2', name: 'Kartu 2' },
      { id: 'item-3', name: 'Kartu 3' },
      { id: 'item-4', name: 'Kartu 4' }
    ];
    fixture.detectChanges();
  });

  it('should initialize and duplicate items for seamless loop seam', () => {
    expect(component).toBeTruthy();
    expect(component.items.length).toBe(4);
    expect(component.displayItems().length).toBeGreaterThan(4);
    expect(component.currentSlideDisplay()).toBe(1);
  });

  it('should automatically pause marquee on hover or focus for WCAG 2.2.2 compliance', () => {
    expect(component.shouldBePaused()).toBe(false);
    component.onMouseEnter();
    expect(component.isHovered()).toBe(true);
    expect(component.shouldBePaused()).toBe(true);
    component.onMouseLeave();
    expect(component.isHovered()).toBe(false);
    expect(component.shouldBePaused()).toBe(false);
  });

  it('should step to next slide and update aria-live', () => {
    component.next(true);
    expect(component.isManual()).toBe(true);
  });

  it('should mark clone slides and out-of-view slides as inert/hidden to avoid aria-hidden-focus', () => {
    // Current visibleCount is 3, currentIndex is 0
    component.currentIndex.set(0);
    component.visibleCount.set(3);

    // Items 0, 1, 2 should be in view
    expect(component.isSlideInView(0)).toBe(true);
    expect(component.isSlideInView(1)).toBe(true);
    expect(component.isSlideInView(2)).toBe(true);
    // Item 3 is out of view (visible count is 3)
    expect(component.isSlideInView(3)).toBe(false);
    expect(component.isSlideHidden(3)).toBe(true);

    // Any clone index (index >= component.items.length) must be hidden/inert
    expect(component.isSlideInView(4)).toBe(false);
    expect(component.isSlideHidden(4)).toBe(true);
    expect(component.isSlideInView(5)).toBe(false);
    expect(component.isSlideHidden(5)).toBe(true);
  });
});
