import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { LeaderboardResponse, generateLeaderboardData } from './mock-data';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  /**
   * Ambil data leaderboard berdasarkan weekId (format YYYY-Www)
   */
  getLeaderboard(week = '2026-W47'): Observable<LeaderboardResponse> {
    if (environment.useMock) {
      return of(generateLeaderboardData(week));
    }

    return this.http.get<LeaderboardResponse>(
      `${environment.apiUrl}/leaderboard?week=${week}`,
      { headers: this.auth.getAuthHeaders() }
    ).pipe(
      catchError((err) => {
        this.toast.error('Gagal memuat data leaderboard minggu ' + week, 'Error Jaringan');
        return throwError(() => err);
      })
    );
  }
}
