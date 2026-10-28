import { defineConfig } from 'astro/config';

// Ganti `site` dengan domain produksi Anda (dipakai untuk canonical & hreflang).
export default defineConfig({
  site: 'https://pelitahatisuci.org',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'id',
    locales: ['id', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
