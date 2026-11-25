import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DummySimplimate } from '../../../core/services/mock-data';
import { ToastService } from '../../../core/services/toast.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { PixelButtonComponent } from '../pixel-button/pixel-button.component';

@Component({
  selector: 'app-demo-user-modal',
  imports: [CommonModule, AvatarComponent, PixelButtonComponent],
  template: `
    @if (isOpen) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-50 bg-ink/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
        (click)="onBackdropClick($event)"
      >
        <!-- Modal Dialog Box (Max-w-lg, 3 Cards Layout) -->
        <div
          #modalBox
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-modal-title"
          class="relative w-full max-w-lg bg-paper border-2 sm:border-3 border-ink shadow-[4px_4px_0_#141414] sm:shadow-[6px_6px_0_#141414] rounded-[10px] sm:rounded-[12px] overflow-hidden my-auto"
          (click)="$event.stopPropagation()"
        >
          <!-- Retro Header Bar -->
          <div class="bg-brand-strong text-white px-3 py-2 sm:px-4 sm:py-3 border-b-2 sm:border-b-3 border-ink flex items-center justify-between gap-2">
            <h2 id="demo-modal-title" class="font-pixel text-sm sm:text-base font-bold uppercase tracking-wide truncate">
              Pilih Akun Demo
            </h2>
            <button
              #closeBtn
              type="button"
              (click)="closeModal()"
              class="w-8 h-8 sm:w-9 sm:h-9 min-w-[32px] min-h-[32px] bg-brand-ink text-white font-pixel font-bold border-2 border-ink shadow-[2px_2px_0_#141414] rounded-[6px] flex items-center justify-center hover:bg-brand-deep cursor-pointer focus-visible:outline-none shrink-0"
              aria-label="Tutup modal pilih akun demo"
              title="Tutup Modal"
            >
              ✕
            </button>
          </div>

          <!-- Description banner (Teks ringkas tanpa emoji) -->
          <div class="p-2.5 sm:p-3 bg-white border-b-2 border-ink text-[11px] sm:text-xs text-ink-muted leading-tight">
            <p>
              Mode demo juri dan evaluator. Tersedia 3 profil pilihan untuk menguji simulasi tidur, leaderboard, dan koleksi kartu.
            </p>
          </div>

          <!-- 3 Simplimates Cards Stack -->
          <div class="p-2.5 sm:p-4 max-h-[60vh] overflow-y-auto space-y-2 sm:space-y-2.5">
            @for (user of users(); track user.id) {
              <div
                (click)="selectUser(user)"
                tabindex="0"
                (keydown.enter)="selectUser(user)"
                (keydown.space)="$event.preventDefault(); selectUser(user)"
                [ngClass]="[
                  'p-2.5 sm:p-3 rounded-[8px] border-2 cursor-pointer transition-all flex items-center gap-2.5 sm:gap-3 select-none focus-visible:outline-none',
                  currentUser()?.id === user.id
                    ? 'bg-brand-100 border-brand-strong shadow-[3px_3px_0_#C21F42] sm:shadow-[4px_4px_0_#C21F42] font-semibold'
                    : 'bg-white border-ink hover:bg-brand-50 hover:border-brand-strong shadow-[2px_2px_0_#141414] sm:shadow-[3px_3px_0_#141414]'
                ]"
                role="button"
                [attr.aria-label]="user.name + ', ' + user.role + ' — pilih akun demo'"
              >
                <!-- Avatar -->
                <app-avatar [name]="user.name" [avatar]="user.avatar" size="md" class="shrink-0"></app-avatar>

                <!-- Info -->
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-1.5">
                    <h4 class="font-bold text-xs sm:text-sm text-ink truncate leading-tight">
                      {{ user.name }}
                    </h4>
                    @if (currentUser()?.id === user.id) {
                      <span class="font-pixel text-[9px] sm:text-[10px] bg-brand-strong text-white px-1.5 py-0.5 rounded-[4px] uppercase shrink-0">
                        Aktif
                      </span>
                    }
                  </div>
                  <p class="text-[11px] sm:text-xs text-brand-ink font-semibold truncate">{{ user.role }}</p>
                  @if (user.personality && user.personality.trim()) {
                    <p class="text-[10px] sm:text-[11px] text-ink-muted italic truncate mt-0.5">
                      "{{ user.personality }}"
                    </p>
                  }
                  @if (user.baseStreak || user.baseAvgScore) {
                    <div class="flex items-center gap-2 mt-1 text-[10px] sm:text-[11px] font-pixel text-ink-muted flex-wrap">
                      @if (user.baseStreak) {
                        <span class="bg-brand-50 border border-brand-200 px-1.5 py-0.2 rounded-[4px] whitespace-nowrap">Streak: {{ user.baseStreak }}m</span>
                      }
                      @if (user.baseAvgScore) {
                        <span class="bg-sun/30 border border-sun px-1.5 py-0.2 rounded-[4px] whitespace-nowrap">Skor: {{ user.baseAvgScore }}</span>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Modal Footer -->
          <div class="p-2.5 sm:p-3 bg-brand-50 border-t-2 border-ink flex items-center justify-between text-xs gap-2">
            <span class="text-ink font-pixel font-bold text-[11px] sm:text-xs">{{ users().length || 3 }} Akun Tersedia</span>
            <app-pixel-button variant="secondary" size="sm" (clicked)="closeModal()" ariaLabel="Batal dan tutup modal">
              Batal
            </app-pixel-button>
          </div>
        </div>
      </div>
    }
  `
})
export class DemoUserModalComponent implements OnChanges {
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Output() userSelected = new EventEmitter<DummySimplimate>();

  @ViewChild('modalBox') modalBox?: ElementRef<HTMLElement>;
  @ViewChild('closeBtn') closeBtn?: ElementRef<HTMLButtonElement>;

  users = signal<DummySimplimate[]>([]);
  readonly currentUser = this.auth.currentUser;

  private triggerElement: HTMLElement | null = null;

  loadUsers(): void {
    this.auth.getDemoUsers().subscribe({
      next: (list) => {
        this.users.set(list);
      },
      error: (err) => {
        console.error('Failed to load demo users in modal', err);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        if (this.users().length === 0) {
          this.loadUsers();
        }
        if (typeof document !== 'undefined') {
          this.triggerElement = document.activeElement as HTMLElement | null;
        }
        setTimeout(() => {
          this.closeBtn?.nativeElement?.focus();
        }, 50);
      } else {
        if (this.triggerElement && typeof this.triggerElement.focus === 'function') {
          this.triggerElement.focus();
        }
      }
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event): void {
    if (this.isOpen) {
      event.preventDefault();
      this.closeModal();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen || event.key !== 'Tab') return;

    const modal = this.modalBox?.nativeElement;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex="0"]:not([disabled]), a[href]:not([disabled])'
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  selectUser(user: DummySimplimate): void {
    this.auth.loginDemo(user.id, user).subscribe({
      next: () => {
        this.toast.success(`Masuk sebagai ${user.name}`, 'Demo Login');
        this.userSelected.emit(user);
        this.closeModal();
      },
      error: (err) => {
        const errorMsg = err?.error?.error || 'Gagal masuk akun demo';
        this.toast.error(errorMsg, 'Demo Login');
      }
    });
  }

  closeModal(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
