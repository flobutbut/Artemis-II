/**
 * NASA **Missions** blog RSS — official flight-day / “Flight Update” posts during Artemis II
 * (crew activities, burns, spacecraft systems such as the Orion toilet, etc.).
 * @see https://www.nasa.gov/blogs/missions/
 */
export const NASA_MISSIONS_BLOG_RSS_URL = 'https://www.nasa.gov/blogs/missions/feed/'

/** Same-origin path proxied in dev (Vite) and prod (Netlify). */
export const NASA_MISSIONS_BLOG_PROXY_PATH = '/nasa-missions-blog-feed'

/** Keep tile focused on Artemis II; the blog also covers other missions. */
const ARTEMIS_II_IN_TITLE = /artemis\s*ii/i

/**
 * @param {string} xmlText
 * @param {number} limit
 * @returns {{ title: string, link: string, pubDate: string }[]}
 */
export function parseMissionsBlogRss(xmlText, limit = 8) {
  const doc = new DOMParser().parseFromString(xmlText, 'text/xml')
  if (doc.querySelector('parsererror')) {
    throw new Error('Invalid RSS response')
  }
  const items = [...doc.querySelectorAll('channel > item')]
    .map((el) => {
      const title = el.querySelector('title')?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
      const link = el.querySelector('link')?.textContent?.trim() ?? ''
      const pubDate = el.querySelector('pubDate')?.textContent?.trim() ?? ''
      return { title, link, pubDate }
    })
    .filter((x) => x.title && x.link)
    .filter((x) => ARTEMIS_II_IN_TITLE.test(x.title))
  return items.slice(0, limit)
}

/**
 * @param {number} [limit]
 * @returns {Promise<{ title: string, link: string, pubDate: string }[]>}
 */
export async function fetchMissionsBlogArtemis2Items(limit = 8) {
  const res = await fetch(NASA_MISSIONS_BLOG_PROXY_PATH, {
    headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' },
  })
  if (!res.ok) {
    throw new Error(`Feed request failed (${res.status})`)
  }
  const xml = await res.text()
  return parseMissionsBlogRss(xml, limit)
}
