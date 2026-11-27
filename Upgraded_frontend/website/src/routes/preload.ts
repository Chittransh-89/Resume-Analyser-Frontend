export const pageImports = {
  analyze: () => import('../pages/AnalyzePage'),
  classify: () => import('../pages/ClassifyPage'),
  advisor: () => import('../pages/AdvisorPage'),
  about: () => import('../pages/AboutPage'),
} as const

export type PageKey = keyof typeof pageImports

/**
 * Warms a route's chunk before the click lands, so the transition never has to
 * suspend mid-swap. Fire-and-forget: errors fall back to the normal lazy load.
 */
export function preloadPage(key: PageKey) {
  void pageImports[key]().catch(() => undefined)
}
