export const images: Record<string, ImageEntry> = {
  garden: {
    src: '/images/hero-garden-1200.webp', w: 1200, h: 1200,
    srcset: '/images/hero-garden-720.webp 720w, /images/hero-garden-1200.webp 1200w',
    sizes: '(max-width: 960px) 100vw, 560px',
  },
  dhammasala: { src: '/images/hero-dhammasala.webp', w: 1376, h: 768 },
  community: { src: '/images/community-da-jia-ting.webp', w: 1376, h: 768 },
  culinary: { src: '/images/culinary-santap-nabati.webp', w: 1200, h: 896 },
  respect: { src: '/images/respect-bakti-orang-tua.webp', w: 1200, h: 896 },
  education: { src: '/images/education-kelas-moral-anak.webp', w: 1376, h: 768 },
  mindfulness: { src: '/images/mindfulness-keheningan-nurani.webp', w: 1376, h: 768 },
};

export type ImageEntry = { src: string; w: number; h: number; srcset?: string; sizes?: string };

export type ImageKey = keyof typeof images;
