import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog: satu file .md per artikel per bahasa.
 * `key` sama di kedua bahasa -> dipakai untuk URL dan tombol ganti bahasa.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    lang: z.enum(['id', 'zh']),
    key: z.string(),
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.enum(['maitri', 'family', 'veg', 'silence', 'story']),
    readMinutes: z.number(),
    author: z.string(),
    cover: z.enum(['garden', 'dhammasala', 'community', 'culinary', 'respect', 'education', 'mindfulness']),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog };
