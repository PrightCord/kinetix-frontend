import type { DesignDefinition } from '../types.ts';

export const brutalistDesign: DesignDefinition = {
  id: 'brutalist',
  name: 'Neo-Brutalist',
  tagline: 'High-contrast bold architectural blocks',
  description:
    'A bold neo-brutalist interpretation engineered for maximum legibility and industrial presence. Features thick 2.5px solid borders, hard 4px offset box shadows, high-saturation semantic accents, and stark geometric blocks.',
  level: 2,
  cssClass: 'design-brutalist',
  features: [
    'Thick solid 2.5px high-contrast structural borders',
    'Hard 4px offset rectangular drop shadows with zero blur',
    'Sharp 0px corner radii on all cards and tables',
    'High-saturation neon yellow, cyan, and hot coral status badges',
    'Bold monospaced typography with heavy tracking',
  ],
};
