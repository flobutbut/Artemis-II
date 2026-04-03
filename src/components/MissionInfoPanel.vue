<script setup>
import {
  CREW_GROUP_PHOTO,
  CREW_MEMBERS,
  MISSION_OBJECTIVES,
  MISSION_HIGH_LEVEL,
  MISSION_PHASES,
  SHIP_SYSTEMS,
} from '../data/mission-info.js'
defineProps({
  tab: { type: String, required: true },
  /** When true, tabpanel is not shown (e.g. Trajectory selected). */
  panelHidden: { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="info-panel"
    role="tabpanel"
    :id="`panel-${tab}`"
    :aria-labelledby="`tab-${tab}`"
    :aria-hidden="panelHidden"
  >
    <template v-if="tab === 'crew'">
      <div class="crew-page">
        <figure class="crew-hero ds-panel">
          <div class="crew-hero__frame">
            <img
              class="crew-hero__img"
              :src="CREW_GROUP_PHOTO.src"
              :alt="CREW_GROUP_PHOTO.alt"
              width="1151"
              height="1440"
              loading="lazy"
              decoding="async"
            />
            <figcaption class="crew-hero__cap ds-text-caption">
              {{ CREW_GROUP_PHOTO.credit }} ·
              <a class="ds-link" :href="CREW_GROUP_PHOTO.href" target="_blank" rel="noopener noreferrer">NASA Image Library</a>
            </figcaption>
          </div>
        </figure>

        <ul class="crew-grid">
          <li v-for="(m, i) in CREW_MEMBERS" :key="i" class="crew-card ds-panel">
            <img
              v-if="m.portrait"
              class="crew-card__portrait"
              :src="m.portrait.src"
              :alt="m.portrait.alt"
              width="576"
              height="768"
              loading="lazy"
              decoding="async"
            />
            <div class="crew-card__body">
              <p class="crew-card__role">{{ m.role }} · {{ m.agency }}</p>
              <h3 class="crew-card__name">{{ m.name }}</h3>
              <p class="ds-text-caption">{{ m.note }}</p>
              <p v-if="m.portrait" class="crew-card__credit ds-text-caption">
                {{ m.portrait.credit }} ·
                <a class="ds-link" :href="m.portrait.href" target="_blank" rel="noopener noreferrer">Wikipedia</a>
                <template v-if="m.portrait.commonsHref">
                  ·
                  <a class="ds-link" :href="m.portrait.commonsHref" target="_blank" rel="noopener noreferrer">Commons</a>
                </template>
              </p>
            </div>
          </li>
        </ul>
      </div>
    </template>

    <template v-else-if="tab === 'ship'">
      <h2 class="ds-heading-section">Ship &amp; rocket</h2>
      <p class="info-panel__lead ds-text-caption">
        Artemis II launches on the <strong>Space Launch System</strong> with the <strong>Orion</strong> spacecraft. Overview:
        <a class="ds-link" href="https://www.nasa.gov/artemis-ii/" target="_blank" rel="noopener noreferrer">Artemis II</a
        >.
      </p>
      <ul class="info-panel__ships">
        <li v-for="(s, i) in SHIP_SYSTEMS" :key="i" class="info-panel__card ds-panel">
          <h3 class="ds-heading-block">
            <a v-if="s.href" class="ds-link" :href="s.href" target="_blank" rel="noopener noreferrer">{{ s.title }}</a>
            <template v-else>{{ s.title }}</template>
          </h3>
          <figure v-if="s.shipPhoto" class="info-panel__ship-photo ds-panel">
            <img
              class="info-panel__ship-photo-img"
              :src="s.shipPhoto.src"
              :alt="s.shipPhoto.alt"
              loading="lazy"
              decoding="async"
            />
            <figcaption class="info-panel__ship-photo-cap ds-text-caption">
              {{ s.shipPhoto.credit }} ·
              <a class="ds-link" :href="s.shipPhoto.href" target="_blank" rel="noopener noreferrer">NASA Image Library</a>
            </figcaption>
          </figure>
          <p class="ds-text-caption">{{ s.summary }}</p>
        </li>
      </ul>
    </template>

    <template v-else-if="tab === 'mission'">
      <h2 class="ds-heading-section">Artemis mission</h2>
      <p class="info-panel__lead ds-text-caption">
        Artemis II is a <strong>crewed lunar flyby</strong> that proves Orion and SLS with astronauts in deep space. Program hub:
        <a class="ds-link" href="https://www.nasa.gov/humans-in-space/artemis/" target="_blank" rel="noopener noreferrer"
          >Artemis</a
        >.
      </p>
      <dl class="info-panel__facts">
        <dt>Mission type</dt>
        <dd>{{ MISSION_HIGH_LEVEL.type }}</dd>
        <dt>Crew</dt>
        <dd>{{ MISSION_HIGH_LEVEL.crewSize }} astronauts</dd>
        <dt>Nominal duration</dt>
        <dd>{{ MISSION_HIGH_LEVEL.nominalDuration }}</dd>
        <dt>Launch site</dt>
        <dd>{{ MISSION_HIGH_LEVEL.launchSite }}</dd>
        <dt>Vehicles</dt>
        <dd>{{ MISSION_HIGH_LEVEL.vehicles }}</dd>
        <dt>Profile</dt>
        <dd>{{ MISSION_HIGH_LEVEL.destinationProfile }}</dd>
      </dl>
      <h3 class="ds-heading-block">Objectives (summary)</h3>
      <ul class="info-panel__list">
        <li v-for="(o, i) in MISSION_OBJECTIVES" :key="i" class="ds-text-caption">{{ o }}</li>
      </ul>
      <h3 class="ds-heading-block">Indicative timeline</h3>
      <p class="ds-text-caption info-panel__hint">
        Illustrative phases for a ~10-day flight; actual flight days depend on mission rules and navigation.
      </p>
      <div class="info-panel__phases">
        <div v-for="(p, i) in MISSION_PHASES" :key="i" class="info-panel__phase ds-panel">
          <div class="info-panel__phase-head">
            <span class="info-panel__phase-title">{{ p.phase }}</span>
            <span class="info-panel__phase-win ds-text-caption">{{ p.window }}</span>
          </div>
          <p class="ds-text-caption">{{ p.detail }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.info-panel {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--ds-space-5) var(--ds-space-5) var(--ds-space-8);
  background: var(--ds-color-bg-app);
  color: var(--ds-color-text-primary);
}

/* ——— Crew ——— */
.crew-page {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-5);
}

.crew-hero {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.crew-hero__frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.crew-hero__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 25%;
}

.crew-hero__cap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: var(--ds-space-6) var(--ds-space-3) var(--ds-space-2);
  color: var(--ds-color-text-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.55);
  background: linear-gradient(
    to top,
    rgba(5, 8, 15, 0.92) 0%,
    rgba(5, 8, 15, 0.45) 50%,
    transparent 100%
  );
}

.crew-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--ds-space-4);
}

@media (max-width: 800px) {
  .crew-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .crew-grid {
    grid-template-columns: 1fr;
  }
}

.crew-card {
  margin: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.crew-card__portrait {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: center 15%;
}

.crew-card__body {
  padding: var(--ds-space-3) var(--ds-space-4) var(--ds-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-2);
  flex: 1;
}

.crew-card__role {
  margin: 0;
  font-size: var(--ds-font-size-2xs);
  font-weight: var(--ds-font-weight-semibold);
  color: var(--ds-color-text-accent);
  text-transform: uppercase;
  letter-spacing: var(--ds-letter-spacing-wider);
  line-height: var(--ds-line-height-tight);
}

.crew-card__name {
  margin: 0;
  font-family: var(--ds-font-family-sans);
  font-size: var(--ds-font-size-xl);
  font-weight: var(--ds-font-weight-semibold);
  color: var(--ds-color-text-primary);
  line-height: var(--ds-line-height-tight);
  letter-spacing: var(--ds-letter-spacing-tight);
}

.crew-card__body .ds-text-caption {
  margin: 0;
  line-height: var(--ds-line-height-snug);
}

.crew-card__credit {
  margin-top: auto !important;
  padding-top: var(--ds-space-2);
  opacity: 0.6;
}

/* ——— Shared lead ——— */
.info-panel__lead {
  margin: 0 0 var(--ds-space-4);
  max-width: 52rem;
  line-height: var(--ds-line-height-relaxed);
}

/* ——— Ship ——— */
.info-panel__ships {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--ds-space-3);
  max-width: 52rem;
}

.info-panel__ship-photo {
  margin: 0 0 var(--ds-space-3);
  padding: var(--ds-space-2);
  overflow: hidden;
  border-radius: var(--ds-radius-md, 8px);
  background: color-mix(in srgb, var(--ds-color-text-primary) 6%, var(--ds-color-bg-app));
}

.info-panel__ship-photo-img {
  display: block;
  width: 100%;
  height: auto;
  max-height: min(26rem, 52vh);
  margin: 0 auto;
  object-fit: contain;
  object-position: center;
}

.info-panel__ship-photo-cap {
  margin: 0;
  padding: var(--ds-space-2) var(--ds-space-3) var(--ds-space-3);
}

.info-panel__card {
  margin: 0;
  padding: var(--ds-space-3) var(--ds-space-4);
}

.info-panel__card .ds-heading-block {
  margin-bottom: var(--ds-space-1);
}

/* ——— Mission facts ——— */
.info-panel__facts {
  margin: 0 0 var(--ds-space-4);
  max-width: 52rem;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--ds-space-2) var(--ds-space-4);
  font-size: var(--ds-font-size-sm);
}

.info-panel__facts dt {
  margin: 0;
  color: var(--ds-color-text-secondary);
}

.info-panel__facts dd {
  margin: 0;
}

.info-panel__list {
  margin: 0 0 var(--ds-space-4);
  padding-left: var(--ds-space-4);
  max-width: 52rem;
}

.info-panel__list li {
  margin-bottom: var(--ds-space-2);
}

.info-panel__hint {
  margin: calc(-1 * var(--ds-space-2)) 0 var(--ds-space-3);
  max-width: 52rem;
}

.info-panel__phases {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-2);
  max-width: 52rem;
}

.info-panel__phase {
  margin: 0;
  padding: var(--ds-space-3) var(--ds-space-4);
}

.info-panel__phase-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--ds-space-2);
  margin-bottom: var(--ds-space-2);
}

.info-panel__phase-title {
  font-weight: var(--ds-font-weight-semibold);
  color: var(--ds-color-text-accent);
  font-size: var(--ds-font-size-base);
}

.info-panel__phase-win {
  font-variant-numeric: tabular-nums;
}

.info-panel__phase p {
  margin: 0;
}
</style>
