import { configureAxe } from 'vitest-axe'

// Note: color-contrast is enabled but effectively skipped under JSDOM because
// axe needs a rendered canvas to compute pixel colors. Check contrast in a real
// browser (Chrome DevTools Lighthouse, axe DevTools) or migrate to Playwright.
export const axe = configureAxe({
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  },
})
