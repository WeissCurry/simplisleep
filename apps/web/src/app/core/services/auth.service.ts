import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from 'shared';
import { environment } from '../../../environments/environment';
import { DUMMY_SIMPLIMATES, DummySimplimate } from './mock-data';
import { ToastService } from './toast.service';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MeResponse {
  user: User;
  wallet: {
    address: string;
  };
  today: {
    status: 'idle' | 'active' | 'completed' | 'broken';
    startedAt?: string;
    started_at?: string;
    score?: number;
    session?: any;
  };
  streak: number;
}

const STORAGE_KEY_USER = 'simplisleep_current_user_id';
const STORAGE_KEY_TOKEN = 'simplisleep_auth_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private cachedDemoUsers: DummySimplimate[] = [];

  // Default ke Simplimate pertama jika belum ada di localStorage
  private currentUserSignal = signal<DummySimplimate>(this.getInitialUser());
  private tokenSignal = signal<string>(this.getInitialToken());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => {
    const token = this.tokenSignal();
    return typeof token === 'string' && token.trim().length > 0;
  });

  getToken(): string {
    return this.tokenSignal();
  }

  private getInitialUser(): DummySimplimate {
    if (typeof window === 'undefined') return DUMMY_SIMPLIMATES[0];
    const savedProfile = localStorage.getItem('simplisleep_current_user_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed && parsed.name) {
          if (parsed.id === 'user-1') parsed.id = 'budi-santoso';
          else if (parsed.id === 'user-2') parsed.id = 'siti-rahma';
          else if (parsed.id === 'user-3') parsed.id = 'gilang-ramadhan';
          return parsed;
        }
      } catch {}
    }
    const savedId = localStorage.getItem(STORAGE_KEY_USER);
    const found = DUMMY_SIMPLIMATES.find(
      (u) =>
        u.id === savedId ||
        (savedId === 'user-1' && u.id === 'budi-santoso') ||
        (savedId === 'user-2' && u.id === 'siti-rahma') ||
        (savedId === 'user-3' && u.id === 'gilang-ramadhan')
    );
    return found || DUMMY_SIMPLIMATES[0];
  }

  private getInitialToken(): string {
    if (typeof window === 'undefined') {
      return environment.useMock ? 'mock-jwt-token-12345' : '';
    }
    const stored = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (stored) return stored;
    return environment.useMock ? 'mock-jwt-token-12345' : '';
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.tokenSignal();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  /**
   * Ambil daftar 12 Simplimate dummy untuk dipilih pada login demo
   */
  getDemoUsers(): Observable<DummySimplimate[]> {
    if (environment.useMock) {
      this.cachedDemoUsers = DUMMY_SIMPLIMATES;
      return of(DUMMY_SIMPLIMATES);
    }
    return this.http.get<DummySimplimate[]>(`${environment.apiUrl}/demo-users`).pipe(
      tap((users) => {
        this.cachedDemoUsers = users;
      })
    );
  }

  /**
   * Login mode DEMO dengan memilih Simplimate
   */
  loginDemo(userId: string, selectedProfile?: DummySimplimate): Observable<AuthResponse> {
    if (environment.useMock) {
      let selected =
        selectedProfile ||
        this.cachedDemoUsers.find((u) => u.id === userId) ||
        DUMMY_SIMPLIMATES.find((u) => u.id === userId);

      if (!selected) {
        if (userId === 'user-1') selected = { ...DUMMY_SIMPLIMATES[0], id: 'user-1' };
        else if (userId === 'user-2') selected = { ...DUMMY_SIMPLIMATES[1], id: 'user-2' };
        else if (userId === 'user-3') selected = { ...DUMMY_SIMPLIMATES[2], id: 'user-3' };
        else selected = DUMMY_SIMPLIMATES[0];
      }

      const mockToken = `demo-token-${selected.id}-${Date.now()}`;
      this.setUserSession(selected, mockToken);
      this.toast.success(`Berhasil masuk sebagai ${selected.name}.`, 'Login Berhasil');
      return of({
        token: mockToken,
        user: selected
      });
    }

    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/demo`, { userId })
      .pipe(
        tap((res) => {
          const matched =
            selectedProfile ||
            this.cachedDemoUsers.find((u) => u.id === userId) ||
            res.user;

          const fullUser: DummySimplimate = {
            id: res.user.id,
            name: res.user.name,
            avatar: res.user.avatar,
            role: res.user.role || (matched as any).role || 'Simplimate',
            walletAddress: res.user.walletAddress || (res as any).wallet?.address || (matched as any).walletAddress,
            personality: (res.user as any).personality || (matched as any).personality || '',
            baseStreak: (matched as any).baseStreak ?? (res.user as any).baseStreak ?? 0,
            baseAvgScore: (matched as any).baseAvgScore ?? (res.user as any).baseAvgScore ?? 85,
            medianSleepTime: (matched as any).medianSleepTime || (res.user as any).medianSleepTime || '23:00'
          };
          this.setUserSession(fullUser, res.token);
          this.toast.success(`Berhasil masuk sebagai ${fullUser.name}.`, 'Login Berhasil');
        }),
        catchError((err) => {
          this.toast.error('Gagal melakukan login demo ke server.', 'Login Gagal');
          return throwError(() => err);
        })
      );
  }

  /**
   * Login menggunakan Google Sign-In (ID Token dari Google Identity Services)
   */
  loginGoogle(idToken: string): Observable<AuthResponse> {
    if (environment.useMock) {
      return throwError(() => new Error('Login Google tidak tersedia dalam mode mock'));
    }

    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/google`, { idToken })
      .pipe(
        tap((res) => {
          const fullUser: DummySimplimate = {
            id: res.user.id,
            name: res.user.name,
            avatar: res.user.avatar || 'user-1',
            role: res.user.role || 'Simplimate',
            walletAddress: res.user.walletAddress || (res as any).wallet?.address,
            personality: (res.user as any).personality || '',
            baseStreak: (res.user as any).baseStreak ?? 0,
            baseAvgScore: (res.user as any).baseAvgScore ?? 85,
            medianSleepTime: (res.user as any).medianSleepTime || '23:00'
          };
          this.setUserSession(fullUser, res.token);
          this.toast.success(`Selamat datang, ${fullUser.name}!`, 'Login Berhasil');
        }),
        catchError((err) => {
          this.toast.error('Gagal melakukan autentikasi dengan Google.', 'Login Gagal');
          return throwError(() => err);
        })
      );
  }

  /**
   * Ambil data profil & sesi aktif diri sendiri (/api/me)
   */
  getMe(): Observable<MeResponse> {
    const user = this.currentUserSignal();

    if (environment.useMock) {
      return of({
        user,
        wallet: {
          address: user.walletAddress || '0x3B8F89aF73B8e5B7711929312E4957f12aC9981a'
        },
        today: {
          status: 'idle'
        },
        streak: user.baseStreak
      });
    }

    if (!this.isAuthenticated() || !this.getToken()) {
      return of({
        user,
        wallet: {
          address: user?.walletAddress || ''
        },
        today: {
          status: 'idle'
        },
        streak: 0
      });
    }

    return this.http.get<MeResponse>(`${environment.apiUrl}/me`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((res) => {
        if (res.user && !res.user.walletAddress && res.wallet?.address) {
          res.user.walletAddress = res.wallet.address;
        }
        return res;
      })
    );
  }

  private setUserSession(user: DummySimplimate, token: string): void {
    this.currentUserSignal.set(user);
    this.tokenSignal.set(token);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_USER, user.id);
      localStorage.setItem('simplisleep_current_user_profile', JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
    }
  }

  logout(): void {
    const fallback = DUMMY_SIMPLIMATES[0];
    this.currentUserSignal.set(fallback);
    this.tokenSignal.set('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem('simplisleep_current_user_profile');
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
    this.toast.info('Kamu telah keluar dari akun.', 'Logout Berhasil');
  }
}
