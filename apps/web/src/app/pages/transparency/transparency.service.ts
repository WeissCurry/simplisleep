import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { generateLeaderboardData } from '../../core/services/mock-data';
import { keccakLeaderboard } from '../../core/utils/keccak.util';

export interface TransparencyRecord {
  week: string;
  hash: string;
  txHash: string;
  chainId: number;
  committedAt: string;
  blockNumber: number;
  contractAddress: string;
  status: 'committed' | 'pending';
}

export function computeMockWeekHash(weekId: string): string {
  const data = generateLeaderboardData(weekId);
  return keccakLeaderboard(
    data.rows.map((r) => ({
      rank: r.rank,
      userId: r.userId,
      avgScore: r.avgScore
    }))
  );
}

export const DUMMY_TRANSPARENCY_RECORDS: TransparencyRecord[] = [
  {
    week: '2026-W47',
    hash: '0xpending_commit_will_run_on_sunday_23_59_wib_snapshot',
    txHash: '',
    chainId: 11155111,
    committedAt: 'Pending Minggu 23:59 WIB',
    blockNumber: 0,
    contractAddress: '0x71bE26D1D6FfaB631C4d2C38290352F3918a09bE',
    status: 'pending'
  },
  {
    week: '2026-W46',
    hash: computeMockWeekHash('2026-W46'),
    txHash: '0x3f58a74e908b9821de837264aefc90226b87201c89320857321ff8b2c4e1a0b3',
    chainId: 11155111,
    committedAt: '2026-11-16T00:05:00.000Z',
    blockNumber: 7129841,
    contractAddress: '0x71bE26D1D6FfaB631C4d2C38290352F3918a09bE',
    status: 'committed'
  },
  {
    week: '2026-W45',
    hash: computeMockWeekHash('2026-W45'),
    txHash: '0x8821bc09a47ef1294821a084efbc91238476101c89481204817294810238194a',
    chainId: 11155111,
    committedAt: '2026-11-09T00:04:12.000Z',
    blockNumber: 7089124,
    contractAddress: '0x71bE26D1D6FfaB631C4d2C38290352F3918a09bE',
    status: 'committed'
  }
];

@Injectable({
  providedIn: 'root'
})
export class TransparencyService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  getTransparencyRecords(): Observable<TransparencyRecord[]> {
    if (environment.useMock) {
      return of(DUMMY_TRANSPARENCY_RECORDS);
    }
    return this.http
      .get<TransparencyRecord[]>(`${environment.apiUrl}/transparency`, {
        headers: this.auth.getAuthHeaders()
      })
      .pipe(
        map((records) =>
          records.map((r) => ({
            ...r,
            blockNumber: r.blockNumber || 0,
            contractAddress: r.contractAddress || '0x71bE26D1D6FfaB631C4d2C38290352F3918a09bE',
            status: r.status || (r.txHash ? 'committed' : 'pending')
          }))
        )
      );
  }

  getPublicLeaderboardRows(weekId: string): Array<{ rank: number; userId: string; avgScore: number }> {
    const data = generateLeaderboardData(weekId);
    return data.rows.map((r) => ({
      rank: r.rank,
      userId: r.userId,
      avgScore: r.avgScore
    }));
  }
}
