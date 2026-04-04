<script setup>
import { ref } from 'vue'
import SourcesButton from './SourcesButton.vue'
import SourcesModal from './SourcesModal.vue'

const showSources = ref(false)
</script>

<template>
  <footer class="footer">
    <div class="footer__inner">
      <p class="footer__line">
        Earth / Moon textures:
        <a
          class="ds-link"
          href="https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets"
          target="_blank"
          rel="noopener noreferrer"
        >
          three.js repo (MIT)
        </a>
        · NASA interactive tracking:
        <a class="ds-link" href="https://www.nasa.gov/trackartemis" target="_blank" rel="noopener noreferrer">AROW</a>
        · Data:
        <a class="ds-link" href="https://ssd.jpl.nasa.gov/api/horizons.api" target="_blank" rel="noopener noreferrer">
          Horizons API
        </a>
      </p>
      <SourcesButton variant="ghost" @click="showSources = true" />
    </div>
    <SourcesModal v-model="showSources" />
  </footer>
</template>

<style scoped>
.footer {
  flex-shrink: 0;
  padding: var(--ds-space-3) var(--ds-space-5);
  background: var(--ds-color-surface-base);
  border-top: 1px solid var(--ds-color-border-subtle);
  backdrop-filter: blur(var(--ds-blur-panel));
  font-size: var(--ds-font-size-base);
  color: var(--ds-color-text-secondary);
}

.footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-space-4);
  min-width: 0;
}

.footer__line {
  margin: 0;
  line-height: var(--ds-line-height-snug);
  min-width: 0;
}

@media (max-width: 600px) {
  .footer {
    padding: var(--ds-space-2) var(--ds-space-3);
    font-size: var(--ds-font-size-xs);
  }

  .footer__inner {
    gap: var(--ds-space-3);
  }
}
</style>
