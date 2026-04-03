<script setup>
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
</script>

<template>
  <aside class="tuile ds-panel ds-panel--glass" aria-live="polite">
    <header class="tuile__intro">
      <h2 class="ds-heading-section">Données JPL Horizons</h2>
      <p class="tuile__lead">
        Positions, vitesses et trajectoire : éphémérides
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
        Cibles : Artemis II · Orion <code class="tuile__code">-1024</code>, Lune <code class="tuile__code">301</code> ·
        référence <strong>centre Terre</strong> · repère écliptique J2000 (DE441).
      </p>
    </header>

    <section class="tuile__section" aria-labelledby="tuile-mesures">
      <h3 id="tuile-mesures" class="ds-heading-block">Mesures instantanées</h3>
      <dl class="tuile__dl">
        <dt>Distance centre Terre</dt>
        <dd>{{ telemetry.distEarth }}</dd>
        <dt>Distance centre Lune</dt>
        <dd>{{ telemetry.distMoon }}</dd>
        <dt>Vitesse (état vectoriel)</dt>
        <dd>{{ telemetry.speed }}</dd>
      </dl>
    </section>

    <section class="tuile__section" aria-labelledby="tuile-actu">
      <h3 id="tuile-actu" class="ds-heading-block">Actualisation</h3>
      <p class="tuile__status ds-text-caption">
        <span v-if="ephemLoading">Éphéméride en cours…</span>
        <span v-else-if="ephemError" class="ds-text-danger">{{ ephemError }}</span>
        <span v-else>Dernière mise à jour : {{ ephemUpdated }}</span>
      </p>
    </section>

    <section class="tuile__section" aria-labelledby="tuile-traj">
      <h3 id="tuile-traj" class="ds-heading-block">Trajectoire affichée</h3>
      <p class="tuile__traj ds-text-caption" :class="{ 'ds-text-danger': !!trajError }">
        {{ trajStatus }}
      </p>
      <p v-if="trajError" class="tuile__traj-err ds-text-caption ds-text-danger">{{ trajError }}</p>
    </section>

    <section class="tuile__section" aria-labelledby="tuile-scene">
      <h3 id="tuile-scene" class="ds-heading-block">Lecture de la scène 3D</h3>
      <ul class="tuile__list ds-text-caption">
        <li>
          <strong>Échelle</strong> : Terre et trajectoire à l’échelle des positions Horizons. Lune : rayon d’affichage ≥
          {{ moonDisplayRadiusMin }} (unités scène), le centre reste la position Horizons.
        </li>
        <li>
          <strong>Orion</strong> : maillage agrandi pour le repérer ; position d’après Horizons.
        </li>
        <li>
          <strong>Courbe</strong> : segments droits entre échantillons (pas de lissage Catmull-Rom).
        </li>
        <li>
          <strong>Fenêtre OEM</strong> (Horizons) : {{ missionSplineStartLabel }} → {{ missionSplineEndLabel }} — pas
          d’échantillonnage {{ missionStep }} sur cette série.
        </li>
        <li>
          <strong>Décollage de référence</strong> : {{ missionLaunchLabel }}. Les ~3 h 24 avant séparation ICPS ne sont pas
          couvertes par cette extraction Horizons.
        </li>
        <li><strong>Caméra</strong> : glisser (clic maintenu) pour orbiter.</li>
      </ul>
    </section>
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
  font-size: var(--ds-font-size-md);
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
</style>
