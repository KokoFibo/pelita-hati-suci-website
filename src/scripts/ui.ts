import { gsap } from 'gsap';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Durasi 0 bila pengguna meminta gerak dikurangi. */
const dur = (n: number) => (reduced() ? 0 : n);
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));

/* ---------------------------------------------------------------- Theme */
export function initTheme() {
  const root = document.documentElement;
  const btns = $<HTMLButtonElement>('[data-theme-toggle]');
  const sync = () => {
    const dark = root.dataset.theme === 'dark';
    btns.forEach((b) => {
      b.setAttribute('aria-pressed', String(dark));
      b.setAttribute('aria-label', (dark ? b.dataset.toLight : b.dataset.toDark) || '');
    });
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#121614' : '#fcf9f3');
  };
  sync();
  btns.forEach((b) =>
    b.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('phs-theme-v2', next); } catch {}
      sync();
      gsap.fromTo(b.querySelectorAll('.ms'), { rotate: -90, scale: 0.5 }, { rotate: 0, scale: 1, duration: dur(0.55), ease: 'back.out(2)' });
    }),
  );
}

/* --------------------------------------------------------------- Header */
export function initHeader() {
  const hdr = document.querySelector<HTMLElement>('[data-header]');
  if (!hdr) return;
  const on = () => hdr.classList.toggle('is-scrolled', window.scrollY > 8);
  on();
  window.addEventListener('scroll', on, { passive: true });
}

/* ---------------------------------------------------------- Mobile menu */
export function initMenu() {
  const menu = document.querySelector<HTMLElement>('[data-mnav]');
  const burger = document.querySelector<HTMLButtonElement>('[data-burger]');
  if (!menu || !burger) return;
  const panel = menu.querySelector<HTMLElement>('.mnav__panel')!;
  const bd = menu.querySelector<HTMLElement>('.mnav__bd')!;
  const items = $('[data-mnav-item]', menu);
  const closeBtn = menu.querySelector<HTMLButtonElement>('button[data-mnav-close]')!;
  let open = false;

  gsap.set(panel, { xPercent: 105 });
  gsap.set(bd, { autoAlpha: 0 });

  const focusables = () =>
    $<HTMLElement>('a[href], button:not([disabled])', panel).filter((el) => el.offsetParent !== null);

  const set = (v: boolean) => {
    if (v === open) return;
    open = v;
    burger.setAttribute('aria-expanded', String(v));
    burger.setAttribute('aria-label', (v ? burger.dataset.closeLabel : burger.dataset.openLabel) || '');
    document.body.classList.toggle('is-locked', v);
    gsap.killTweensOf([panel, bd, ...items]);
    if (v) {
      menu.inert = false;
      menu.classList.add('is-open');
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .to(bd, { autoAlpha: 1, duration: dur(0.35) }, 0)
        .to(panel, { xPercent: 0, duration: dur(0.6), ease: 'power4.out' }, 0)
        .fromTo(items, { x: 28, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: dur(0.5), stagger: dur(0.06) }, dur(0.2));
      closeBtn.focus({ preventScroll: true });
    } else {
      gsap
        .timeline({
          defaults: { ease: 'power3.in' },
          onComplete: () => { menu.classList.remove('is-open'); menu.inert = true; },
        })
        .to(panel, { xPercent: 105, duration: dur(0.4) }, 0)
        .to(bd, { autoAlpha: 0, duration: dur(0.4) }, 0);
      burger.focus({ preventScroll: true });
    }
  };

  burger.addEventListener('click', () => set(!open));
  $('[data-mnav-close]', menu).forEach((el) => el.addEventListener('click', () => set(false)));
  $('a', menu).forEach((a) => a.addEventListener('click', () => { if (a.getAttribute('href')?.startsWith('#')) set(false); }));
  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') return set(false);
    if (e.key === 'Tab') {
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // Tutup drawer bila layar melebar sampai tombol hamburger disembunyikan (titik ganti berbeda per bahasa).
  window.addEventListener('resize', () => { if (open && getComputedStyle(burger).display === 'none') set(false); });
}

/* ------------------------------------------------------------------ FAQ */
export function initFaq() {
  $<HTMLDetailsElement>('details.faq').forEach((d) => {
    const body = d.querySelector<HTMLElement>('.faq__body')!;
    d.querySelector('summary')!.addEventListener('click', (e) => {
      e.preventDefault();
      gsap.killTweensOf(body);
      if (d.open && !d.classList.contains('is-closing')) {
        d.classList.add('is-closing');
        d.classList.remove('is-open');
        gsap.to(body, {
          height: 0, duration: dur(0.35), ease: 'power2.inOut',
          onComplete: () => { d.open = false; d.classList.remove('is-closing'); gsap.set(body, { clearProps: 'height' }); },
        });
      } else {
        d.classList.remove('is-closing');
        d.open = true;
        d.classList.add('is-open');
        gsap.fromTo(body, { height: 0 }, { height: 'auto', duration: dur(0.45), ease: 'power2.out', onComplete: () => gsap.set(body, { clearProps: 'height' }) });
      }
    });
  });
}

/* -------------------------------------------------------------- Filters */
export function initFilters() {
  $('[data-filter-scope]').forEach((scope) => {
    const btns = $<HTMLButtonElement>('[data-filter]', scope);
    const items = $('[data-filter-item]', scope);
    const search = scope.querySelector<HTMLInputElement>('[data-filter-search]');
    const empty = scope.querySelector<HTMLElement>('[data-filter-empty]');
    let cat = 'all';
    let q = '';
    let tl: gsap.core.Timeline | null = null;

    const apply = () => {
      const show: HTMLElement[] = [];
      const hide: HTMLElement[] = [];
      items.forEach((el) => {
        const okC = cat === 'all' || (el.dataset.cat || '').split(' ').includes(cat);
        const okQ = !q || (el.dataset.text || '').includes(q);
        (okC && okQ ? show : hide).push(el);
      });
      tl?.kill();
      tl = gsap.timeline();
      const out = hide.filter((el) => !el.hidden);
      if (out.length) {
        tl.to(out, { autoAlpha: 0, scale: 0.96, duration: dur(0.2), ease: 'power1.in', onComplete: () => out.forEach((el) => (el.hidden = true)) });
      }
      tl.add(() => {
        show.forEach((el) => (el.hidden = false));
        if (empty) empty.hidden = show.length > 0;
      });
      if (show.length) {
        tl.fromTo(show, { autoAlpha: 0, y: 18, scale: 1 }, { autoAlpha: 1, y: 0, duration: dur(0.45), stagger: dur(0.05), ease: 'power2.out', clearProps: 'transform' });
      }
    };

    btns.forEach((b) =>
      b.addEventListener('click', () => {
        cat = b.dataset.filter || 'all';
        btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        apply();
      }),
    );
    search?.addEventListener('input', () => { q = search.value.trim().toLowerCase(); apply(); });
  });
}

/* ---------------------------------------------------------------- Forms */
/** Formulir hanya front-end. Sambungkan ke backend/layanan form pada bagian TODO. */
export function initForms() {
  $('[data-form-wrap]').forEach((wrap) => {
    const form = wrap.querySelector<HTMLFormElement>('form');
    const body = wrap.querySelector<HTMLElement>('[data-form-body]');
    const ok = wrap.querySelector<HTMLElement>('[data-form-success]');
    const again = wrap.querySelector<HTMLElement>('[data-form-again]');
    if (!form || !body || !ok) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) return void form.reportValidity();
      // TODO: kirim `new FormData(form)` ke endpoint Anda (Formspree, Netlify Forms, API sendiri, dll).
      body.hidden = true;
      ok.hidden = false;
      gsap.fromTo(ok, { autoAlpha: 0, y: 16, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: dur(0.55), ease: 'back.out(1.6)' });
    });
    again?.addEventListener('click', () => {
      form.reset();
      ok.hidden = true;
      body.hidden = false;
      gsap.fromTo(body, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur(0.4) });
    });
  });
}

/* Tautan placeholder (href="#") tidak melompat ke atas halaman. */
export function initPlaceholders() {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest('a[href="#"]');
    if (a) e.preventDefault();
  });
}

/* Salin tautan artikel */
export function initCopy() {
  $<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    const label = btn.querySelector('span');
    const original = label?.textContent || '';
    btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(location.href); } catch { return; }
      if (label) label.textContent = btn.dataset.copied || original;
      gsap.fromTo(btn, { scale: 0.94 }, { scale: 1, duration: dur(0.4), ease: 'back.out(3)' });
      setTimeout(() => { if (label) label.textContent = original; }, 2200);
    });
  });
}

/* Tombol bahasa desktop: thumb bergeser halus ke segmen tujuan, baru pindah halaman. */
export function initLangSwitch() {
  $('[data-lang-switch]').forEach((box) => {
    const thumb = box.querySelector<HTMLElement>('.lang__thumb');
    const link = box.querySelector<HTMLAnchorElement>('a.lang__seg');
    const segs = $('.lang__seg', box);
    if (!thumb || !link) return;
    let busy = false;

    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; // biarkan buka tab baru
      e.preventDefault();
      if (busy) return;
      if (reduced()) { location.href = link.href; return; }
      busy = true;
      const w = thumb.offsetWidth;
      const toZh = box.dataset.active === 'id';
      segs.forEach((s) => s.classList.toggle('is-on', s === link));
      gsap.fromTo(
        thumb,
        { x: toZh ? 0 : w },
        {
          x: toZh ? w : 0, duration: 0.55, ease: 'power3.inOut',
          onComplete: () => { gsap.delayedCall(0.12, () => { location.href = link.href; }); },
        },
      );
    });

    // Kembali dengan tombol Back (bfcache): pulihkan posisi awal.
    window.addEventListener('pageshow', (e) => {
      if (!e.persisted) return;
      busy = false;
      gsap.set(thumb, { clearProps: 'transform' });
      segs.forEach((s) => s.classList.toggle('is-on', s.hasAttribute('aria-current')));
    });
  });
}

/* Tahun hak cipta selalu mengikuti tahun saat ini. */
export function initYear() {
  $('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
}
