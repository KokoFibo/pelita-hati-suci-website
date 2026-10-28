import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));

/** Pecah teks heading menjadi kata-kata bertopeng (tanpa plugin berbayar). Teks asli tetap tersedia untuk screen reader. */
function splitWords(el: HTMLElement): HTMLElement[] {
  const text = (el.textContent || '').trim();
  el.textContent = '';
  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = text;
  el.appendChild(sr);
  const inner: HTMLElement[] = [];
  // Kata dipisah spasi; teks CJK dipecah per karakter (tanda baca menempel pada karakter sebelumnya).
  const CJK = /[「『“‘（(]*[\u3400-\u9fff\uf900-\ufaff][\u3000-\u303f\uff00-\uffef\u2018-\u201d]*|[^\s\u3400-\u9fff\uf900-\ufaff]+/g;
  const chunks = text.split(/\s+/);
  chunks.forEach((chunk, ci) => {
    (chunk.match(CJK) || []).forEach((tok) => {
      const w = document.createElement('span');
      w.className = 'w';
      w.setAttribute('aria-hidden', 'true');
      const s = document.createElement('span');
      s.textContent = tok;
      w.appendChild(s);
      el.appendChild(w);
      inner.push(s);
    });
    if (ci < chunks.length - 1) el.appendChild(document.createTextNode(' '));
  });
  return inner;
}

const CLEAR = 'opacity,visibility,transform';

export function initAnimations() {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    /* 1. Heading split ------------------------------------------------ */
    const splits = new Map<HTMLElement, HTMLElement[]>();
    $('[data-split]').forEach((el) => splits.set(el, splitWords(el)));

    /* 2. Hero intro timeline ----------------------------------------- */
    const hero = document.querySelector<HTMLElement>('[data-hero]');
    if (hero) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });
      const h1 = hero.querySelector<HTMLElement>('[data-split]');
      const words = h1 ? splits.get(h1) : null;
      if (words) tl.fromTo(words, { yPercent: 115, rotate: 3 }, { yPercent: 0, rotate: 0, duration: 1, stagger: 0.045 }, 0.1);
      const items = $('[data-hero-item]', hero);
      if (items.length) tl.fromTo(items, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.11, clearProps: CLEAR }, 0.05);
      const frame = hero.querySelector<HTMLElement>('[data-hero-frame]');
      if (frame) {
        tl.fromTo(
          frame,
          { clipPath: 'inset(7% 6% 7% 6% round 28px)', scale: 1.05, autoAlpha: 0 },
          { clipPath: 'inset(0% 0% 0% 0% round 24px)', scale: 1, autoAlpha: 1, duration: 1.3, ease: 'power3.out', clearProps: 'clipPath,transform' },
          0.2,
        );
      }
      // Melayang pelan setelah intro selesai
      $('[data-float]', hero).forEach((el, i) =>
        gsap.to(el, { y: -9, duration: 3.2 + i * 0.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.8 }),
      );
    }

    /* 3. Scroll: headings -------------------------------------------- */
    splits.forEach((words, el) => {
      if (el.closest('[data-hero]')) return;
      gsap.fromTo(
        words,
        { yPercent: 115, rotate: 3 },
        { yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.035, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } },
      );
    });

    /* 4. Scroll: generic reveals ------------------------------------- */
    $('[data-reveal]').forEach((el) => {
      const dir = el.dataset.reveal;
      const from: gsap.TweenVars = { autoAlpha: 0 };
      if (dir === 'left') from.x = -44;
      else if (dir === 'right') from.x = 44;
      else if (dir === 'scale') from.scale = 0.94;
      else if (dir !== 'fade') from.y = 34;
      gsap.fromTo(el, from, {
        autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.95, ease: 'power3.out', clearProps: CLEAR,
        delay: Number(el.dataset.delay || 0),
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    $('[data-stagger]').forEach((box) => {
      const kids = Array.from(box.children) as HTMLElement[];
      gsap.fromTo(kids, { autoAlpha: 0, y: 40 }, {
        autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out', clearProps: CLEAR,
        scrollTrigger: { trigger: box, start: 'top 86%', once: true },
      });
    });

    /* 5. Parallax images --------------------------------------------- */
    $('[data-parallax]').forEach((img) => {
      const wrap = (img.parentElement || img) as HTMLElement;
      gsap.fromTo(img, { yPercent: -6, scale: 1.14 }, {
        yPercent: 6, scale: 1.14, ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
    });

    /* 6. Decorative spin --------------------------------------------- */
    $('[data-spin]').forEach((el) => gsap.to(el, { rotation: 360, duration: 90, ease: 'none', repeat: -1 }));

    /* 7. Header: sembunyi saat scroll turun, muncul saat naik --------- */
    const hdr = document.querySelector<HTMLElement>('[data-header]');
    if (hdr) {
      const show = gsap.from(hdr, { yPercent: -100, paused: true, duration: 0.3, ease: 'power2.out' }).progress(1);
      ScrollTrigger.create({
        start: 'top -220', end: 'max',
        onUpdate: (self) => {
          if (document.body.classList.contains('is-locked')) return;
          self.direction === -1 ? show.play() : show.reverse();
        },
      });
      ScrollTrigger.create({ start: 'top -220', end: 'max', onLeaveBack: () => show.play() });
    }

    /* 9. Progress baca artikel ---------------------------------------- */
    const bar = document.querySelector<HTMLElement>('[data-progress]');
    const body = document.querySelector<HTMLElement>('[data-post-body]');
    if (bar && body) {
      gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: body, start: 'top 30%', end: 'bottom 70%', scrub: 0.3 } });
    }

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });

  /* 8. Tombol magnetik (hanya pointer halus & gerak normal) ---------- */
  mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const cleanups: Array<() => void> = [];
    $('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.32);
      };
      const leave = () => { xTo(0); yTo(0); };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      cleanups.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); });
    });
    return () => cleanups.forEach((fn) => fn());
  });
}
