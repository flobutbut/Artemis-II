<script setup>
import { watch, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.modelValue) {
    e.preventDefault()
    close()
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (typeof document === 'undefined') return
    if (open) {
      document.addEventListener('keydown', onKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = ''
    }
  },
)

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

const sources = [
  {
    title: 'Éphémérides mission (positions, vitesses, trajectoire)',
    items: [
      {
        label: 'NASA / JPL Horizons On-Line Ephemeris System',
        href: 'https://ssd.jpl.nasa.gov/horizons/',
        note: 'Vecteurs géométriques, repère écliptique J2000, centre Terre (code 500).',
      },
      {
        label: 'API Horizons (requêtes JSON)',
        href: 'https://ssd.jpl.nasa.gov/api/horizons.api',
        note: 'Appelée via le proxy local /jpl-horizons (dev, preview, Netlify).',
      },
      {
        label: 'Fiche cible Artemis II · Orion (Horizons ID −1024)',
        href: 'https://ssd.jpl.nasa.gov/horizons/app.html#/?sstr=-1024',
        note: 'Métadonnées mission et plage OEM.',
      },
    ],
  },
  {
    title: 'Suivi public NASA',
    items: [
      {
        label: 'AROW — Artemis Real-time Orbit Website',
        href: 'https://www.nasa.gov/trackartemis',
        note: 'Suivi officiel interactif.',
      },
    ],
  },
  {
    title: 'Rendu 3D',
    items: [
      {
        label: 'three.js (bibliothèque WebGL)',
        href: 'https://threejs.org/',
        note: 'Licence MIT.',
      },
      {
        label: 'Textures Terre / Lune (exemples three.js)',
        href: 'https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets',
        note: 'Fichiers d’exemple du dépôt three.js (MIT).',
      },
    ],
  },
  {
    title: 'Images & médias NASA',
    items: [
      {
        label: 'NASA — Images and Media Usage Guidelines',
        href: 'https://www.nasa.gov/nasa-brand-center/images-and-media/',
        note: 'Pour toute réutilisation de contenus NASA.',
      },
    ],
  },
]
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="ds-modal-backdrop"
      role="presentation"
      @click.self="close"
    >
      <div
        class="ds-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sources-modal-title"
      >
        <header class="ds-modal__header">
          <h2 id="sources-modal-title" class="ds-modal__title">Sources de l’application</h2>
          <button type="button" class="ds-btn ds-btn--icon ds-focusable" aria-label="Fermer" @click="close">
            ×
          </button>
        </header>
        <div class="ds-modal__body">
          <p class="modal-lead">
            Données de trajectoire et télémétrie affichées : <strong>JPL Horizons</strong>. Cette interface est
            indépendante de la NASA et ne constitue pas un produit officiel.
          </p>
          <section v-for="(block, i) in sources" :key="i" class="modal-block">
            <h3 class="ds-heading-block">{{ block.title }}</h3>
            <ul class="modal-list">
              <li v-for="(item, j) in block.items" :key="j">
                <a class="ds-link" :href="item.href" target="_blank" rel="noopener noreferrer">{{ item.label }}</a>
                <span class="modal-note ds-text-caption">{{ item.note }}</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-lead {
  margin: 0 0 var(--ds-space-4);
  line-height: var(--ds-line-height-relaxed);
  color: var(--ds-color-text-secondary);
}

.modal-lead strong {
  color: var(--ds-color-text-code);
  font-weight: var(--ds-font-weight-semibold);
}

.modal-block {
  margin-top: var(--ds-space-4);
}

.modal-block:first-of-type {
  margin-top: 0;
}

.modal-list {
  margin: 0;
  padding-left: var(--ds-space-4);
  list-style: disc;
}

.modal-list li {
  margin-bottom: var(--ds-space-2);
  line-height: var(--ds-line-height-normal);
}

.modal-note {
  display: block;
  margin-top: 2px;
}
</style>
