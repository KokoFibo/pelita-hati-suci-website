import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/utils';

export type Post = CollectionEntry<'blog'>;

export async function getPosts(lang: Lang): Promise<Post[]> {
  const all = await getCollection('blog', (p) => p.data.lang === lang);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const blogBase: Record<Lang, string> = { id: '/artikel-wacana/', zh: '/zh/articles/' };
export const postPath = (key: string, lang: Lang) => `${blogBase[lang]}${key}/`;

export const categoryIcon: Record<string, string> = {
  silence: 'self_improvement',
  veg: 'eco',
  family: 'diversity_1',
  maitri: 'public',
  story: 'volunteer_activism',
};
