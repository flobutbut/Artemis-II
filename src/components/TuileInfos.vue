<script setup>
import { ref, watch } from 'vue'
import DsTabs from './DsTabs.vue'
import {
  fetchMissionsBlogArtemis2Items,
  NASA_MISSIONS_BLOG_RSS_URL,
} from '../lib/nasa-missions-blog-feed.js'

/** NASA live stream (YouTube); embed when “NASA Live” tab is selected. */
const NASA_LIVE_YOUTUBE_ID = '6RwfNBtepa4'
const NASA_LIVE_WATCH_URL = `https://www.youtube.com/watch?v=${NASA_LIVE_YOUTUBE_ID}`

const TUILE_TABS = [
  { id: 'flight-updates', label: 'Flight updates' },
  { id: 'nasa-live', label: 'NASA Live' },
  { id: 'horizons', label: 'JPL data' },
]

const FEED_LIMIT = 8

const feedItems = ref([])
const feedLoading = ref(false)
const feedError = ref(null)
let feedLoaded = false

const tuileTab = ref('flight-updates')

async function loadFlightUpdatesFeed() {
  feedLoading.value = true
  feedError.value = null
  try {
    feedItems.value = await fetchMissionsBlogArtemis2Items(FEED_LIMIT)
    feedLoaded = true
  } catch (e) {
    feedError.value = e instanceof Error ? e.message : 'Could not load feed'
    feedItems.value = []
  } finally {
    feedLoading.value = false
  }
}

watch(
  () => tuileTab.value,
  (id) => {
    if (id === 'flight-updates' && !feedLoaded && !feedLoading.value) {
      loadFlightUpdatesFeed()
    }
  },
  { immediate: true },
)

defineProps({
  telemetry: {
    type: Object,
    required: true,
  },
  ephemLoading: { type: Boolean, default: true },
  ephemError: { type: String, default: null },
  ephemUpdated: { type: String, default: '—' },
  trajStatus: { type: String, default: '' },
  trajError: { type: String, default: null },
  moonDisplayRadiusMin: { type: Number, required: true },
  missionStep: { type: String, required: true },
  missionSplineStartLabel: { type: String, required: true },
  missionSplineEndLabel: { type: String, required: true },
  missionLaunchLabel: { type: String, required: true },
})

function formatFeedDate(pubDate) {
  if (!pubDate) return ''
  const d = new Date(pubDate)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { dateStyle: 'medium' })
}
</script>

<template>
  <aside class="tuile ds-panel ds-panel--glass" aria-live="polite">
    <div class="tuile__tabs">
      <DsTabs v-model="tuileTab" :tabs="TUILE_TABS" aria-label="Trajectory side panel" />
    </div>

    <div
      v-if="tuileTab === 'flight-updates'"
      class="tuile__panel tuile__panel--feed"
      role="tabpanel"
      id="panel-flight-updates"
      aria-labelledby="tab-flight-updates"
    >
      <header class="tuile__feed-intro">
        <h2 class="ds-heading-section">Flight updates</h2>
        <p class="tuile__lead tuile__lead--compact">
          NASA’s <strong>Missions</strong> blog: flight-day posts and “Flight Update” articles during Artemis II (burns, crew
          timeline, spacecraft systems — not raw telemetry). Each title opens the official post.
        </p>
      </header>

      <div v-if="feedLoading" class="tuile__feed-status ds-text-caption" aria-live="polite">Loading updates…</div>
      <div v-else-if="feedError" class="tuile__feed-status ds-text-caption">
        <span class="ds-text-danger">{{ feedError }}</span>
        <button type="button" class="tuile__feed-retry" @click="loadFlightUpdatesFeed">Retry</button>
      </div>
      <p v-else-if="feedItems.length === 0" class="tuile__feed-status ds-text-caption">
        No Artemis II posts in the current feed window (titles must include “Artemis II”).
      </p>
      <ul v-else class="tuile__feed-list" aria-label="Artemis II flight updates">
        <li v-for="(it, i) in feedItems" :key="i + it.link" class="tuile__feed-item">
          <a class="tuile__feed-link ds-link" :href="it.link" target="_blank" rel="noopener noreferrer">{{
            it.title
          }}</a>
          <span v-if="formatFeedDate(it.pubDate)" class="tuile__feed-date ds-text-caption">{{
            formatFeedDate(it.pubDate)
          }}</span>
        </li>
      </ul>

      <p class="tuile__feed-source ds-text-caption">
        Source:
        <a class="ds-link" :href="NASA_MISSIONS_BLOG_RSS_URL" target="_blank" rel="noopener noreferrer">
          NASA Missions blog (RSS)
        </a>
      </p>
    </div>

    <div
      v-else-if="tuileTab === 'nasa-live'"
      class="tuile__panel tuile__panel--live"
      role="tabpanel"
      id="panel-nasa-live"
      aria-labelledby="tab-nasa-live"
    >
      <header class="tuile__live-intro">
        <h2 class="ds-heading-section">NASA Live</h2>
        <p class="tuile__lead tuile__lead--compact">
          Official stream on YouTube. If the embed fails, open the video in a new tab.
        </p>
      </header>
      <div class="tuile__embed">
        <iframe
          class="tuile__iframe"
          :src="`https://www.youtube.com/embed/${NASA_LIVE_YOUTUBE_ID}`"
          title="NASA live stream on YouTube"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        />
      </div>
      <p class="tuile__live-link ds-text-caption">
        <a class="ds-link" :href="NASA_LIVE_WATCH_URL" target="_blank" rel="noopener noreferrer">Watch on YouTube</a>
      </p>
    </div>

    <div
      v-else-if="tuileTab === 'horizons'"
      class="tuile__panel"
      role="tabpanel"
      id="panel-horizons"
      aria-labelledby="tab-horizons"
    >
      <header class="tuile__intro">
        <h2 class="ds-heading-section">JPL data</h2>
        <p class="tuile__lead">
          Positions, speeds, and trajectory: ephemeris from
          <a
            class="ds-link"
            href="https://ssd.jpl.nasa.gov/horizons/"
            target="_blank"
            rel="noopener noreferrer"
          >
            JPL Horizons
          </a>.
        </p>
        <p class="tuile__ids ds-text-caption">
          Targets: Artemis II · Orion <code class="tuile__code">-1024</code>, Moon <code class="tuile__code">301</code> ·
          reference <strong>Earth center</strong> · ecliptic J2000 frame (DE441).
        </p>
      </header>

      <section class="tuile__section" aria-labelledby="tuile-mesures">
        <h3 id="tuile-mesures" class="ds-heading-block">Instantaneous measurements</h3>
        <dl class="tuile__dl">
          <dt>Distance to Earth center</dt>
          <dd>{{ telemetry.distEarth }}</dd>
          <dt>Distance to Moon center</dt>
          <dd>{{ telemetry.distMoon }}</dd>
          <dt>Speed (state vector)</dt>
          <dd>{{ telemetry.speed }}</dd>
        </dl>
      </section>

      <section class="tuile__section" aria-labelledby="tuile-actu">
        <h3 id="tuile-actu" class="ds-heading-block">Refresh</h3>
        <p class="tuile__status ds-text-caption">
          <span v-if="ephemLoading">Loading ephemeris…</span>
          <span v-else-if="ephemError" class="ds-text-danger">{{ ephemError }}</span>
          <span v-else>Last update: {{ ephemUpdated }}</span>
        </p>
      </section>

      <section class="tuile__section" aria-labelledby="tuile-traj">
        <h3 id="tuile-traj" class="ds-heading-block">Displayed trajectory</h3>
        <p class="tuile__traj ds-text-caption" :class="{ 'ds-text-danger': !!trajError }">
          {{ trajStatus }}
        </p>
        <p v-if="trajError" class="tuile__traj-err ds-text-caption ds-text-danger">{{ trajError }}</p>
      </section>

      <section class="tuile__section" aria-labelledby="tuile-scene">
        <h3 id="tuile-scene" class="ds-heading-block">Reading the 3D scene</h3>
        <ul class="tuile__list ds-text-caption">
          <li>
            <strong>Scale</strong>: Earth and trajectory match Horizons positions. Moon: display radius ≥
            {{ moonDisplayRadiusMin }} (scene units); center stays at the Horizons position.
          </li>
          <li>
            <strong>Orion</strong>: enlarged mesh for visibility; position from Horizons.
          </li>
          <li>
            <strong>Path</strong>: straight segments between samples (no Catmull-Rom smoothing).
          </li>
          <li>
            <strong>OEM window</strong> (Horizons): {{ missionSplineStartLabel }} → {{ missionSplineEndLabel }} — no
            {{ missionStep }} sampling on this arc.
          </li>
          <li>
            <strong>Reference launch</strong>: {{ missionLaunchLabel }}. The ~3 h 24 before ICPS separation are not covered
            by this Horizons extract.
          </li>
          <li><strong>Camera</strong>: drag (click and hold) to orbit.</li>
        </ul>
      </section>
    </div>
  </aside>
</template>

<style scoped>
.tuile {
  position: absolute;
  top: var(--ds-space-4);
  right: var(--ds-space-4);
  width: min(360px, calc(100% - 2 * var(--ds-space-4)));
  max-height: calc(100% - 2 * var(--ds-space-4));
  overflow-y: auto;
  padding: var(--ds-space-4);
  font-size: var(--ds-font-size-sm);
}

.tuile__tabs {
  margin: 0 0 var(--ds-space-3);
  padding-bottom: var(--ds-space-3);
  border-bottom: 1px solid var(--ds-color-border-subtle);
}

.tuile__tabs :deep(.ds-tabs) {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  justify-content: stretch;
  gap: var(--ds-space-1);
}

.tuile__tabs :deep(.ds-tabs__tab) {
  flex: 1 1 calc(33.333% - var(--ds-space-1));
  min-width: 0;
  text-align: center;
  padding-left: var(--ds-space-2);
  padding-right: var(--ds-space-2);
}

.tuile__panel {
  min-height: 0;
}

.tuile__intro {
  margin: 0;
  padding-bottom: var(--ds-space-4);
  border-bottom: 1px solid var(--ds-color-border-subtle);
}

.tuile__intro .ds-heading-section {
  margin-bottom: var(--ds-space-2);
}

.tuile__lead {
  margin: 0 0 var(--ds-space-2);
  font-size: var(--ds-font-size-base);
  line-height: var(--ds-line-height-snug);
  color: var(--ds-color-text-primary);
}

.tuile__lead--compact {
  font-size: var(--ds-font-size-sm);
}

.tuile__live-intro {
  margin: 0 0 var(--ds-space-3);
}

.tuile__live-intro .ds-heading-section {
  margin-bottom: var(--ds-space-2);
}

.tuile__embed {
  position: relative;
  width: 100%;
  border-radius: var(--ds-radius-md);
  overflow: hidden;
  background: color-mix(in srgb, var(--ds-color-text-primary) 12%, var(--ds-color-bg-app));
  aspect-ratio: 16 / 9;
}

.tuile__iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.tuile__live-link {
  margin: var(--ds-space-2) 0 0;
}

.tuile__ids {
  margin: 0;
}

.tuile__ids strong {
  font-weight: var(--ds-font-weight-semibold);
  color: var(--ds-color-text-primary);
}

.tuile__code {
  font-family: var(--ds-font-family-mono);
  font-size: var(--ds-font-size-xs);
  color: var(--ds-color-text-code);
}

.tuile__section {
  margin-top: var(--ds-space-4);
  padding-top: var(--ds-space-3);
  border-top: 1px solid var(--ds-color-border-subtle);
}

.tuile__section:first-of-type {
  margin-top: var(--ds-space-4);
  padding-top: 0;
  border-top: none;
}

.tuile__section .ds-heading-block {
  margin-bottom: var(--ds-space-2);
}

.tuile__dl {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--ds-space-2) var(--ds-space-3);
}

.tuile__dl dt {
  margin: 0;
  color: var(--ds-color-text-secondary);
}

.tuile__dl dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
  text-align: right;
  color: var(--ds-color-text-primary);
}

.tuile__status {
  margin: 0;
}

.tuile__traj {
  margin: 0;
  color: var(--ds-color-text-accent);
}

.tuile__traj.ds-text-danger {
  color: var(--ds-color-text-danger);
}

.tuile__traj-err {
  margin: var(--ds-space-2) 0 0;
  word-break: break-word;
}

.tuile__list {
  margin: 0;
  padding-left: var(--ds-space-4);
  list-style: disc;
}

.tuile__list li {
  margin-bottom: var(--ds-space-2);
  line-height: var(--ds-line-height-normal);
}

.tuile__list li:last-child {
  margin-bottom: 0;
}

.tuile__list strong {
  font-weight: var(--ds-font-weight-semibold);
  color: var(--ds-color-text-heading-muted);
}

.tuile__feed-intro {
  margin: 0 0 var(--ds-space-3);
}

.tuile__feed-intro .ds-heading-section {
  margin-bottom: var(--ds-space-2);
}

.tuile__feed-status {
  margin: 0 0 var(--ds-space-3);
}

.tuile__feed-retry {
  display: inline-block;
  margin-left: var(--ds-space-2);
  padding: var(--ds-space-1) var(--ds-space-2);
  border: 1px solid var(--ds-color-border-interactive);
  border-radius: var(--ds-radius-sm);
  background: var(--ds-color-accent-muted);
  font-family: var(--ds-font-family-sans);
  font-size: var(--ds-font-size-xs);
  color: var(--ds-color-text-accent);
  cursor: pointer;
}

.tuile__feed-retry:hover {
  border-color: var(--ds-color-border-interactive-hover);
}

.tuile__feed-retry:focus-visible {
  outline: 2px solid var(--ds-color-focus-ring);
  outline-offset: 2px;
}

.tuile__feed-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.tuile__feed-item {
  margin: 0;
  padding: var(--ds-space-2) 0;
  border-bottom: 1px solid var(--ds-color-border-subtle);
}

.tuile__feed-item:first-child {
  padding-top: 0;
}

.tuile__feed-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.tuile__feed-link {
  display: block;
  font-size: var(--ds-font-size-sm);
  line-height: var(--ds-line-height-snug);
  word-break: break-word;
}

.tuile__feed-date {
  display: block;
  margin-top: var(--ds-space-1);
  color: var(--ds-color-text-secondary);
}

.tuile__feed-source {
  margin: var(--ds-space-4) 0 0;
  padding-top: var(--ds-space-3);
  border-top: 1px solid var(--ds-color-border-subtle);
}
</style>
