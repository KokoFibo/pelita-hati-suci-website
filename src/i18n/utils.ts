import { id } from './id';
import { zh } from './zh';
import type { Content } from './id';

export type Lang = 'id' | 'zh';
export const defaultLang: Lang = 'id';
export const langLabel: Record<Lang, string> = { id: 'ID', zh: '繁中' };
/** Label ringkas untuk tombol bahasa di mobile. */
export const langShort: Record<Lang, string> = { id: 'ID', zh: '中' };
/** Nilai atribut lang/hreflang HTML. */
export const htmlLang: Record<Lang, string> = { id: 'id', zh: 'zh-Hant' };

/** Satu sumber kebenaran untuk seluruh URL. Setiap halaman memiliki padanan di kedua bahasa. */
export const routes = {
  home: { id: '/', zh: '/zh/' },
  teachings: { id: '/ajaran-kasih-semesta/', zh: '/zh/universal-love/' },
  education: { id: '/pendidikan-moral-anak/', zh: '/zh/moral-education/' },
  vegetarian: { id: '/budaya-vegetarian/', zh: '/zh/vegetarian-culture/' },
  articles: { id: '/artikel-wacana/', zh: '/zh/articles/' },
  schedule: { id: '/jadwal-kelas-dharma/', zh: '/zh/dharma-schedule/' },
} as const;

export type RouteKey = keyof typeof routes;

export const getContent = (lang: Lang): Content => (lang === 'zh' ? zh : id);

export const routePath = (key: RouteKey, lang: Lang) => routes[key][lang];

/** `href` pada konten boleh berupa kunci rute ("schedule"), anchor ("#pilar") atau URL penuh. */
export function resolveHref(href: string, lang: Lang): string {
  if (href.startsWith('#') || href.startsWith('http') || href.startsWith('/')) return href;
  return href in routes ? routePath(href as RouteKey, lang) : href;
}

export const otherLang = (lang: Lang): Lang => (lang === 'id' ? 'zh' : 'id');

export function formatDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'zh-TW', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso));
}
