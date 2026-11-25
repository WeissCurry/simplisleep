import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Card, DropResult, NightScore, SleepSession, nightScore } from 'shared';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import {
  SAMPLE_DROP_CARDS,
  SleepHistoryItem,
  generate14DaysHistory
} from './mock-data';

export interface WakeUpResult {
  session: SleepSession;
  score: NightScore;
  drop?: {
    card: Card;
  };
}

const STORAGE_KEY_SESSION = 'simplisleep_active_session';
const STORAGE_KEY_HISTORY = 'simplisleep_history_cache';

function getJakartaDateStr(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
}

@Injectable({
  providedIn: 'root'
})
export class SleepService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  // Status sesi tidur saat ini
  private activeSessionSignal = signal<SleepSession | null>(this.getInitialSession());
  readonly activeSession = this.activeSessionSignal.asReadonly();

  // Riwayat 14 hari
  private historySignal = signal<SleepHistoryItem[]>(this.getInitialHistory());
  readonly history = this.historySignal.asReadonly();

  // Last completed score info
  private lastScoreSignal = signal<NightScore | null>(this.getInitialLastScore());
  readonly lastScore = this.lastScoreSignal.asReadonly();

  // Banner "Ketahuan masih melek!"
  readonly brokenBanner = signal<boolean>(false);

  dismissBrokenBanner(): void {
    this.brokenBanner.set(false);
  }

  setActiveSession(session: SleepSession | null): void {
    let normalized = session;
    if (session) {
      normalized = {
        id: session.id,
        userId: session.userId || (session as any).user_id,
        startedAt: session.startedAt || (session as any).started_at,
        endedAt: session.endedAt || (session as any).ended_at || null,
        durationMinutes: session.durationMinutes ?? (session as any).duration_minutes ?? 0,
        status: session.status,
        score: session.score,
        date: session.date
      };
    }
    this.activeSessionSignal.set(normalized);
    if (typeof window !== 'undefined') {
      if (normalized) {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(normalized));
      } else {
        localStorage.removeItem(STORAGE_KEY_SESSION);
      }
    }
  }

  private getInitialSession(): SleepSession | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed) {
        if (!parsed.startedAt && parsed.started_at) {
          parsed.startedAt = parsed.started_at;
        }
        if (!parsed.userId && parsed.user_id) {
          parsed.userId = parsed.user_id;
        }
        if (!parsed.endedAt && parsed.ended_at) {
          parsed.endedAt = parsed.ended_at;
        }
        if (parsed.durationMinutes === undefined && parsed.duration_minutes !== undefined) {
          parsed.durationMinutes = parsed.duration_minutes;
        }
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private getInitialHistory(): SleepHistoryItem[] {
    if (typeof window === 'undefined') return generate14DaysHistory();
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) {
      const generated = generate14DaysHistory();
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(generated));
      return generated;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return generate14DaysHistory();
    }
  }

  private getInitialLastScore(): NightScore | null {
    const hist = this.historySignal();
    if (hist.length > 0) {
      const latest = hist[hist.length - 1];
      return {
        score: latest.score,
        durationScore: Math.min(100, Math.round(latest.score * 0.95)),
        consistencyScore: Math.min(100, Math.round(latest.score * 1.05)),
        label: latest.label,
        durationHours: latest.durationHours
      };
    }
    return {
      score: 88,
      durationScore: 95,
      consistencyScore: 82,
      label: 'Sehat',
      durationHours: 7.8
    };
  }

  /**
   * Catat mulai tidur (Mau tidur)
   */
  startSleep(): Observable<SleepSession> {
    if (environment.useMock) {
      const user = this.auth.currentUser();
      const now = new Date();
      const newSession: SleepSession = {
        id: `sess-${Date.now()}`,
        userId: user.id,
        startedAt: now.toISOString(),
        date: getJakartaDateStr(now),
        status: 'active'
      };

      this.activeSessionSignal.set(newSession);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(newSession));
      }
      this.toast.success('Sesi tidur dimulai. Selamat beristirahat!', 'Mulai Tidur');
      return of(newSession);
    }

    return this.http
      .post<SleepSession>(
        `${environment.apiUrl}/sleep/start`,
        {},
        { headers: this.auth.getAuthHeaders() }
      )
      .pipe(
        tap((session) => {
          this.setActiveSession(session);
          this.toast.success('Sesi tidur dimulai. Selamat beristirahat!', 'Mulai Tidur');
        }),
        catchError((err) => {
          this.toast.error('Gagal mencatat sesi tidur ke server.', 'Error Tidur');
          return throwError(() => err);
        })
      );
  }

  /**
   * Catat bangun tidur (Bangun)
   */
  wakeUp(): Observable<WakeUpResult> {
    if (environment.useMock) {
      const session = this.activeSessionSignal();
      const parsedStart = session?.startedAt ? new Date(session.startedAt).getTime() : NaN;
      const startTime = isNaN(parsedStart) ? Date.now() - 7.5 * 3600 * 1000 : parsedStart;
      const now = Date.now();

      // Durasi tidur simulasi: jika baru saja diclick beberapa detik lalu di demo, beri durasi realistis 7.8 jam
      let durationHours = (now - startTime) / (1000 * 60 * 60);
      if (isNaN(durationHours) || durationHours < 1) {
        durationHours = 7.75; // Durasi manis untuk demo yang baru klik
      }

      // Hitung skor tidur dengan formula murni di packages/shared
      const medianDiffMinutes = 15; // Deviasi realistis
      const score = nightScore(durationHours, medianDiffMinutes);

      const validStartedAt =
        session?.startedAt && !isNaN(new Date(session.startedAt).getTime())
          ? session.startedAt
          : new Date(startTime).toISOString();

      const completedSession: SleepSession = {
        id: session?.id || `sess-${Date.now()}`,
        userId: this.auth.currentUser().id,
        startedAt: validStartedAt,
        endedAt: new Date(now).toISOString(),
        durationMinutes: Math.round(durationHours * 60),
        status: session?.status === 'broken' ? 'broken' : 'completed',
        score: score.score,
        date: getJakartaDateStr()
      };

      // Cek drop kartu: jika skor >= 70, beri drop kartu acak dari assets
      let drop: { card: Card } | undefined = undefined;
      if (score.score >= 70) {
        const randomCard = SAMPLE_DROP_CARDS[Math.floor(Math.random() * SAMPLE_DROP_CARDS.length)];
        drop = { card: randomCard };
      }

      this.activeSessionSignal.set(null);
      this.lastScoreSignal.set(score);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY_SESSION);

        // Update riwayat lokal
        const currentHist = [...this.historySignal()];
        const todayStr = getJakartaDateStr();
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const dayName = dayNames[new Date().getDay()];

        currentHist.push({
          date: todayStr,
          dayName,
          durationMin: Math.round(durationHours * 60),
          durationHours: Math.round(durationHours * 10) / 10,
          score: score.score,
          label: score.label,
          status: completedSession.status as any,
          bedTime: '23:15',
          wakeTime: '07:00'
        });

        // Simpan 14 hari terakhir saja
        const trimmed = currentHist.slice(-14);
        this.historySignal.set(trimmed);
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(trimmed));
      }

      this.toast.success(`Bangun tidur tercatat! Skor: ${score.score} (${score.label}).`, 'Sesi Selesai');
      if (drop?.card) {
        this.toast.info(`Kamu mendapatkan kartu baru: ${drop.card.name}!`, 'Drop Kartu');
      }

      return of({
        session: completedSession,
        score,
        drop
      });
    }

    return this.http
      .post<WakeUpResult>(
        `${environment.apiUrl}/sleep/wake`,
        {},
        { headers: this.auth.getAuthHeaders() }
      )
      .pipe(
        tap((res: any) => {
          this.setActiveSession(null);
          const scoreObj: NightScore = res.scoreDetail || (typeof res.score === 'object' && res.score ? res.score : {
            score: typeof res.score === 'number' ? res.score : 0,
            durationScore: typeof res.score === 'number' ? res.score : 0,
            consistencyScore: typeof res.score === 'number' ? res.score : 0,
            label: (typeof res.score === 'number' && res.score >= 85) ? 'Sangat Baik' : (typeof res.score === 'number' && res.score >= 70) ? 'Optimal' : 'Cukup',
            durationHours: (res.session?.durationMinutes || res.session?.duration_minutes || 480) / 60
          });
          this.lastScoreSignal.set(scoreObj);
          this.toast.success(`Bangun tidur tercatat! Skor: ${scoreObj.score} (${scoreObj.label}).`, 'Sesi Selesai');
          if (res.drop?.card) {
            this.toast.info(`Kamu mendapatkan kartu baru: ${res.drop.card.name}!`, 'Drop Kartu');
          }
        }),
        catchError((err) => {
          this.toast.error('Gagal mengakhiri sesi tidur di server.', 'Error Bangun');
          return throwError(() => err);
        })
      );
  }

  /**
   * Simulasi tidur semalam (8 jam) untuk akun demo:
   * - Menghasilkan sesi 8 jam dengan skor konsistensi tinggi & pasti drop kartu
   */
  simulateNight(): Observable<WakeUpResult> {
    if (environment.useMock) {
      const user = this.auth.currentUser();
      const now = Date.now();
      const durationHours = 8.0;
      const medianDiffMinutes = 15;
      const score = nightScore(durationHours, medianDiffMinutes);

      const startTime = now - 8 * 3600 * 1000;
      const validStartedAt = new Date(startTime).toISOString();

      const completedSession: SleepSession = {
        id: `sess-sim-${Date.now()}`,
        userId: user.id,
        startedAt: validStartedAt,
        endedAt: new Date(now).toISOString(),
        durationMinutes: 480,
        status: 'completed',
        score: score.score,
        date: getJakartaDateStr()
      };

      const randomCard = SAMPLE_DROP_CARDS[Math.floor(Math.random() * SAMPLE_DROP_CARDS.length)];
      const drop: { card: Card } = { card: randomCard };

      this.activeSessionSignal.set(null);
      this.lastScoreSignal.set(score);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY_SESSION);

        const currentHist = [...this.historySignal()];
        const todayStr = getJakartaDateStr();
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const dayName = dayNames[new Date().getDay()];

        currentHist.push({
          date: todayStr,
          dayName,
          durationMin: 480,
          durationHours: 8.0,
          score: score.score,
          label: score.label,
          status: 'completed',
          bedTime: '23:00',
          wakeTime: '07:00'
        });

        const trimmed = currentHist.slice(-14);
        this.historySignal.set(trimmed);
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(trimmed));
      }

      this.toast.success(`Simulasi tidur 8 jam selesai! Skor: ${score.score} (${score.label}).`, 'Simulasi Sukses');
      if (drop.card) {
        this.toast.info(`Kamu memenangkan kartu baru: ${drop.card.name}!`, 'Drop Kartu');
      }

      return of({
        session: completedSession,
        score,
        drop
      });
    }

    return this.http
      .post<WakeUpResult>(
        `${environment.apiUrl}/sleep/simulate-night`,
        {},
        { headers: this.auth.getAuthHeaders() }
      )
      .pipe(
        tap((res: any) => {
          this.setActiveSession(null);
          const scoreObj: NightScore = res.scoreDetail || (typeof res.score === 'object' && res.score ? res.score : {
            score: typeof res.score === 'number' ? res.score : 0,
            durationScore: typeof res.score === 'number' ? res.score : 0,
            consistencyScore: typeof res.score === 'number' ? res.score : 0,
            label: (typeof res.score === 'number' && res.score >= 85) ? 'Sangat Baik' : (typeof res.score === 'number' && res.score >= 70) ? 'Optimal' : 'Cukup',
            durationHours: (res.session?.durationMinutes || res.session?.duration_minutes || 480) / 60
          });
          this.lastScoreSignal.set(scoreObj);
          this.toast.success(`Simulasi tidur 8 jam selesai! Skor: ${scoreObj.score} (${scoreObj.label}).`, 'Simulasi Sukses');
          if (res.drop?.card) {
            this.toast.info(`Kamu memenangkan kartu baru: ${res.drop.card.name}!`, 'Drop Kartu');
          }
        }),
        catchError((err) => {
          this.toast.error(err?.error?.error || 'Gagal menjalankan simulasi tidur di server.', 'Error Simulasi');
          return throwError(() => err);
        })
      );
  }

  /**
   * Kirim heartbeat / buka aplikasi saat tidur (simulasi sesi rusak 'broken')
   */
  heartbeat(): Observable<{ status: string }> {
    if (environment.useMock) {
      const session = this.activeSessionSignal();
      if (session && session.status === 'active') {
        const brokenSession: SleepSession = {
          ...session,
          status: 'broken'
        };
        this.activeSessionSignal.set(brokenSession);
        this.brokenBanner.set(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(brokenSession));
        }
        this.toast.warning('Aplikasi dibuka saat jam tidur: sesi ditandai broken.', 'Perhatian');
        return of({ status: 'broken' });
      }
      return of({ status: 'ok' });
    }

    return this.http
      .post<{ status: string }>(
        `${environment.apiUrl}/heartbeat`,
        {},
        { headers: this.auth.getAuthHeaders() }
      )
      .pipe(
        tap((res) => {
          if (res?.status === 'broken') {
            this.brokenBanner.set(true);
            const current = this.activeSessionSignal();
            if (current) {
              this.setActiveSession({ ...current, status: 'broken' });
            }
            this.toast.warning('Aplikasi dibuka saat jam tidur: sesi ditandai broken.', 'Perhatian');
          }
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  /**
   * Ambil riwayat tidur 14 hari
   */
  getHistory(days = 14): Observable<SleepHistoryItem[]> {
    if (environment.useMock) {
      return of(this.historySignal());
    }

    return this.http
      .get<SleepHistoryItem[]>(
        `${environment.apiUrl}/sleep/history?days=${days}`,
        { headers: this.auth.getAuthHeaders() }
      )
      .pipe(
        tap((items) => {
          const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
          this.historySignal.set(sorted);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(sorted));
          }
        })
      );
  }
}
