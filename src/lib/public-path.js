/**
 * Prefix for files in `public/` when the app is served under a subpath (e.g. GitHub Pages project site).
 */
export function publicUrl(path) {
  const p = String(path).replace(/^\/+/, '')
  const b = import.meta.env.BASE_URL ?? '/'
  const base = b.endsWith('/') ? b : `${b}/`
  return `${base}${p}`
}
