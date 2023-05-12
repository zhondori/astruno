import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';

import UnoCSS from 'unocss/astro';
import { presetWind, presetTypography, transformerDirectives } from 'unocss';
import sitemap from '@astrojs/sitemap';
import image from '@astrojs/image';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import compress from 'astro-compress';
import { readingTimeRemarkPlugin } from './src/utils/frontmatter.mjs';

import { SITE } from './src/config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const whenExternalScripts = (items = []) =>
  SITE.googleAnalyticsId ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

export default defineConfig({
  site: SITE.origin,
  base: SITE.basePathname,
  trailingSlash: SITE.trailingSlash ? 'always' : 'never',

  output: 'static',

  markdown: {
    remarkPlugins: [readingTimeRemarkPlugin],
  },

  integrations: [
    UnoCSS({
      injectReset: true,
      presets: [presetWind(), presetTypography()],
      theme: {
        extend: {
          colors: {
            primary: 'var(--aw-color-primary)',
            secondary: 'var(--aw-color-secondary)',
            accent: 'var(--aw-color-accent)',
          },
          fontFamily: {
            sans: ['var(--aw-font-sans)'],
            serif: ['var(--aw-font-serif)'],
            heading: ['var(--aw-font-heading)'],
          },
        },
      },
      transformers: [transformerDirectives()],
      layers: {
        components: -1,
        default: 1,
        utilities: 2,
      },
    }),
    sitemap(),
    image({
      serviceEntryPoint: '@astrojs/image/sharp',
    }),
    mdx(),

    ...whenExternalScripts(() =>
      partytown({
        config: { forward: ['dataLayer.push'] },
      })
    ),

    compress({
      css: true,
      html: {
        removeAttributeQuotes: false,
      },
      img: false,
      js: true,
      svg: false,

      logger: 1,
    }),
  ],

  vite: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },
});
