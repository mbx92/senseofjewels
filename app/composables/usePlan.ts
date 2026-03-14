/**
 * Feature flag composable.
 * Features are stored as SiteSettings with keys like "featureShop", "featureSeo", etc.
 * Only superadmins can toggle them.
 *
 * Future: replace with license server validation.
 */

export const FEATURES = {
  shop: {
    key: 'featureShop',
    label: 'Shop / Catalog Page',
    description: 'Public /shop page with product catalog, search, and filtering',
    icon: 'shop',
  },
  seo: {
    key: 'featureSeo',
    label: 'SEO & Social Sharing',
    description: 'Meta description, OG image, Google Analytics, sitemap',
    icon: 'seo',
  },
  theme: {
    key: 'featureTheme',
    label: 'Theme Customization',
    description: 'Custom colors and typography fonts',
    icon: 'theme',
  },
} as const

export type FeatureName = keyof typeof FEATURES

export function usePlan() {
  const { data: settings } = useFetch<Record<string, string>>('/api/settings')

  function hasFeature(name: FeatureName): boolean {
    const key = FEATURES[name].key
    return settings.value?.[key] === 'true'
  }

  return { hasFeature, settings }
}
