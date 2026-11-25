import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PixelSliderComponent } from './pixel-slider.component';

describe('PixelSliderComponent Responsive & Interaction', () => {
  let fixture: ComponentFixture<PixelSliderComponent>;
  let component: PixelSliderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PixelSliderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PixelSliderComponent);
    component = fixture.componentInstance;
    component.items = [
      { cardId: 'c1', name: 'Kartu 1', rarity: 'Common' },
      { cardId: 'c2', name: 'Kartu 2', rarity: 'Rare' },
      { cardId: 'c3', name: 'Kartu 3', rarity: 'Epic' },
      { cardId: 'c4', name: 'Kartu 4', rarity: 'Legendary' },
      { cardId: 'c5', name: 'Kartu 5', rarity: 'Common' },
      { cardId: 'c6', name: 'Kartu 6', rarity: 'Rare' }
    ];
    fixture.detectChanges();
  });

  describe('Responsive Metrics Calculation', () => {
    it('should set 5 visible cards on desktop (width >= 1024 or container >= 940)', () => {
      component.updateMetrics(1100);
      expect(component.visibleCount()).toBe(5);
      expect(component.gap()).toBe(14);
      // availableWidth = 1100 - 8 = 1092; visibleGaps = 4; (1092 - 4*14)/5 = 207
      expect(component.itemWidth()).toBe(207);
    });

    it('should set 4 visible cards on tablet (width 768-1023 / container 660-939)', () => {
      // Mock innerWidth to 800
      const origInnerWidth = window.innerWidth;
      try {
        Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
        component.updateMetrics(700);
        expect(component.visibleCount()).toBe(4);
        expect(component.gap()).toBe(12);
        // availableWidth = 700 - 8 = 692; visibleGaps = 3; (692 - 3*12)/4 = 164
        expect(component.itemWidth()).toBe(164);
      } finally {
        Object.defineProperty(window, 'innerWidth', { value: origInnerWidth, configurable: true });
      }
    });

    it('should set 3 visible cards on small tablet (width 540-767 / container 460-659)', () => {
      const origInnerWidth = window.innerWidth;
      try {
        Object.defineProperty(window, 'innerWidth', { value: 600, configurable: true });
        component.updateMetrics(520);
        expect(component.visibleCount()).toBe(3);
        expect(component.gap()).toBe(12);
        // availableWidth = 520 - 8 = 512; visibleGaps = 2; (512 - 2*12)/3 = 162
        expect(component.itemWidth()).toBe(162);
      } finally {
        Object.defineProperty(window, 'innerWidth', { value: origInnerWidth, configurable: true });
      }
    });

    it('should set 2 visible cards plus peek on mobile (width < 540)', () => {
      const origInnerWidth = window.innerWidth;
      try {
        Object.defineProperty(window, 'innerWidth', { value: 344, configurable: true });
        component.updateMetrics(310);
        expect(component.visibleCount()).toBe(2);
        expect(component.gap()).toBe(10);
        // availableWidth = 310 - 8 = 302; visibleGaps = 2; (302 - 2*10)/2.22 = 127
        expect(component.itemWidth()).toBe(127);
      } finally {
        Object.defineProperty(window, 'innerWidth', { value: origInnerWidth, configurable: true });
      }
    });

    it('should handle ultra-narrow mobile (<= 320px) without negative or zero width', () => {
      const origInnerWidth = window.innerWidth;
      try {
        Object.defineProperty(window, 'innerWidth', { value: 280, configurable: true });
        component.updateMetrics(250);
        expect(component.visibleCount()).toBe(2);
        expect(component.gap()).toBe(8);
        expect(component.itemWidth()).toBeGreaterThanOrEqual(90);
      } finally {
        Object.defineProperty(window, 'innerWidth', { value: origInnerWidth, configurable: true });
      }
    });
  });

  describe('Controls & Accessibility', () => {
    it('should automatically pause marquee on hover, focus, and tab hidden for WCAG 2.2.2 compliance', () => {
      expect(component.shouldBePaused()).toBe(false);

      // Hover
      component.onMouseEnter();
      expect(component.isHovered()).toBe(true);
      expect(component.shouldBePaused()).toBe(true);
      component.onMouseLeave();
      expect(component.isHovered()).toBe(false);
      expect(component.shouldBePaused()).toBe(false);

      // Focus
      component.onFocusIn();
      expect(component.isFocused()).toBe(true);
      expect(component.shouldBePaused()).toBe(true);
      const dummyEvent = {
        currentTarget: document.createElement('div'),
        relatedTarget: null
      } as any;
      component.onFocusOut(dummyEvent);
      expect(component.isFocused()).toBe(false);
      expect(component.shouldBePaused()).toBe(false);

      // Tab visibility
      component.isTabVisible.set(false);
      expect(component.shouldBePaused()).toBe(true);
      component.isTabVisible.set(true);
      expect(component.shouldBePaused()).toBe(false);

      // prefers-reduced-motion
      component.prefersReducedMotion.set(true);
      expect(component.shouldBePaused()).toBe(true);
      component.prefersReducedMotion.set(false);
      expect(component.shouldBePaused()).toBe(false);
    });

    it('should pause on touch/drag and keep paused for a few seconds before resuming', async () => {
      expect(component.shouldBePaused()).toBe(false);

      // Touch start
      component.onTouchStart({
        touches: [{ clientX: 200, clientY: 100 }]
      } as any);
      expect(component.isSwiping).toBe(true);
      expect(component.isTouchPaused).toBe(true);
      expect(component.shouldBePaused()).toBe(true);

      // Touch end
      component.onTouchEnd({
        changedTouches: [{ clientX: 190, clientY: 100 }]
      } as any);
      expect(component.isSwiping).toBe(false);
      // Still paused due to isTouchPaused post-touch timeout
      expect(component.isTouchPaused).toBe(true);
      expect(component.shouldBePaused()).toBe(true);
    });

    it('should respond to ArrowRight and ArrowLeft keyboard events', () => {
      const nextSpy = vi.spyOn(component, 'next');
      const prevSpy = vi.spyOn(component, 'prev');

      const eventRight = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      const preventDefaultRightSpy = vi.spyOn(eventRight, 'preventDefault');
      component.onKeyDown(eventRight);
      expect(preventDefaultRightSpy).toHaveBeenCalled();
      expect(nextSpy).toHaveBeenCalledWith(true);

      const eventLeft = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      const preventDefaultLeftSpy = vi.spyOn(eventLeft, 'preventDefault');
      component.onKeyDown(eventLeft);
      expect(preventDefaultLeftSpy).toHaveBeenCalled();
      expect(prevSpy).toHaveBeenCalled();
    });

    it('should correctly handle touch swipe navigation', () => {
      const nextSpy = vi.spyOn(component, 'next');
      const prevSpy = vi.spyOn(component, 'prev');

      // Swipe Left (diffX < -35): Next
      component.onTouchStart({
        touches: [{ clientX: 200, clientY: 100 }]
      } as any);

      component.onTouchEnd({
        changedTouches: [{ clientX: 140, clientY: 105 }] // diffX = -60
      } as any);
      expect(nextSpy).toHaveBeenCalledWith(true);

      // Swipe Right (diffX > 35): Prev
      component.onTouchStart({
        touches: [{ clientX: 100, clientY: 100 }]
      } as any);

      component.onTouchEnd({
        changedTouches: [{ clientX: 160, clientY: 98 }] // diffX = +60
      } as any);
      expect(prevSpy).toHaveBeenCalled();
    });

    it('should pause when hovered or focused', () => {
      component.onMouseEnter();
      expect(component.isHovered()).toBe(true);
      expect(component.shouldBePaused()).toBe(true);

      component.onMouseLeave();
      expect(component.isHovered()).toBe(false);

      component.onFocusIn();
      expect(component.isFocused()).toBe(true);
      expect(component.shouldBePaused()).toBe(true);
    });
  });
});
