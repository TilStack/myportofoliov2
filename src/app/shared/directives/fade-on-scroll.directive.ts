import { Directive, ElementRef, OnInit, OnDestroy, Input } from '@angular/core';

/**
 * Usage: <div appFadeOnScroll class="fade-up">...</div>
 * Applies IntersectionObserver per-element without a global service.
 */
@Directive({
  selector: '[appFadeOnScroll]',
  standalone: true,
})
export class FadeOnScrollDirective implements OnInit, OnDestroy {
  @Input() delay = 0;
  private observer!: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    if (this.delay) {
      this.el.nativeElement.style.transitionDelay = `${this.delay}ms`;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.el.nativeElement.classList.add('visible');
          this.observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
