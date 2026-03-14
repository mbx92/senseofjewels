// Default theme colors (matches DaisyUI "jewels" theme in main.css)
export const THEME_DEFAULTS = {
  colorPrimary: '#2a2a2e',       // charcoal black
  colorPrimaryContent: '#f9f8f5', // warm ivory
  colorSecondary: '#c9a96e',     // champagne gold
  colorSecondaryContent: '#2a2a2e',
  colorAccent: '#b87d5e',        // warm rose gold
  colorBase100: '#f9f8f5',       // warm ivory
  colorBase200: '#f0ede6',
  colorBase300: '#e0dbd0',
  colorBaseContent: '#2b2b2f',
  fontHeading: '',
  fontBody: '',
}

export const FONT_OPTIONS = [
  { label: 'Default (system)', value: '' },
  // Serif — luxury / editorial
  { label: 'Cormorant Garamond', value: 'Cormorant Garamond' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'EB Garamond', value: 'EB Garamond' },
  { label: 'Libre Baskerville', value: 'Libre Baskerville' },
  { label: 'DM Serif Display', value: 'DM Serif Display' },
  { label: 'Cinzel', value: 'Cinzel' },
  { label: 'Italiana', value: 'Italiana' },
  { label: 'Gilda Display', value: 'Gilda Display' },
  // Sans-serif — clean / modern
  { label: 'Josefin Sans', value: 'Josefin Sans' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Raleway', value: 'Raleway' },
  { label: 'Jost', value: 'Jost' },
  { label: 'Lato', value: 'Lato' },
  { label: 'Nunito', value: 'Nunito' },
]

export function useTheme(settings?: Ref<Record<string, string> | null | undefined> | Record<string, string> | null) {
  const resolved = computed(() => {
    const s = isRef(settings) ? settings.value : settings
    return {
      colors: {
        '--color-primary': s?.colorPrimary || THEME_DEFAULTS.colorPrimary,
        '--color-primary-content': s?.colorPrimaryContent || THEME_DEFAULTS.colorPrimaryContent,
        '--color-secondary': s?.colorSecondary || THEME_DEFAULTS.colorSecondary,
        '--color-secondary-content': s?.colorSecondaryContent || THEME_DEFAULTS.colorSecondaryContent,
        '--color-accent': s?.colorAccent || THEME_DEFAULTS.colorAccent,
        '--color-base-100': s?.colorBase100 || THEME_DEFAULTS.colorBase100,
        '--color-base-200': s?.colorBase200 || THEME_DEFAULTS.colorBase200,
        '--color-base-300': s?.colorBase300 || THEME_DEFAULTS.colorBase300,
        '--color-base-content': s?.colorBaseContent || THEME_DEFAULTS.colorBaseContent,
      },
      fontHeading: s?.fontHeading ?? THEME_DEFAULTS.fontHeading,
      fontBody: s?.fontBody ?? THEME_DEFAULTS.fontBody,
    }
  })

  const styleBlock = computed(() => {
    const { colors, fontHeading, fontBody } = resolved.value
    const colorVars = Object.entries(colors).map(([k, v]) => `  ${k}: ${v};`).join('\n')
    const fontVars = [
      fontHeading ? `  --font-serif: '${fontHeading}', Georgia, 'Times New Roman', serif;` : '',
      fontBody ? `  --font-sans: '${fontBody}', system-ui, -apple-system, sans-serif;` : '',
    ].filter(Boolean).join('\n')
    return `:root {\n${colorVars}${fontVars ? '\n' + fontVars : ''}\n}`
  })

  const googleFontsHref = computed(() => {
    const { fontHeading, fontBody } = resolved.value
    const fonts = [...new Set([fontHeading, fontBody].filter(Boolean))]
    if (!fonts.length) return null
    const params = fonts
      .map(f => `family=${encodeURIComponent(f)}:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400`)
      .join('&')
    return `https://fonts.googleapis.com/css2?${params}&display=swap`
  })

  useHead({
    link: () => googleFontsHref.value
      ? [{ rel: 'stylesheet', href: googleFontsHref.value, key: 'jewels-fonts' }]
      : [],
    style: [{ innerHTML: styleBlock, id: 'jewels-theme' }],
  })
}
