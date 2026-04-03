<script setup>
import { ref } from 'vue'
import SourcesModal from './SourcesModal.vue'
import SourcesButton from './SourcesButton.vue'
import DsTabs from './DsTabs.vue'
import { publicUrl } from '../lib/public-path.js'

const patchSrc = publicUrl('artemis-ii-patch.svg')

defineProps({
  modelValue: { type: String, required: true },
  tabs: { type: Array, required: true },
})

const emit = defineEmits(['update:modelValue'])

const showSources = ref(false)
</script>

<template>
  <header class="bar">
    <div class="bar-inner">
      <div class="bar-start">
        <div class="brand">
          <img
            class="brand__logo"
            :src="patchSrc"
            width="32"
            height="33"
            alt="Artemis II mission insignia (NASA)"
            decoding="async"
          />
          <div class="titles">
            <h1 class="ds-heading-page">Artemis II</h1>
          </div>
        </div>
      </div>
      <nav class="bar-center" aria-label="Section navigation">
        <DsTabs
          variant="ghost"
          :model-value="modelValue"
          :tabs="tabs"
          @update:model-value="emit('update:modelValue', $event)"
        />
      </nav>
      <div class="bar-end">
        <SourcesButton variant="ghost" @click="showSources = true" />
      </div>
    </div>
    <SourcesModal v-model="showSources" />
  </header>
</template>

<style scoped>
.bar {
  flex-shrink: 0;
  padding: 0 var(--ds-space-5);
  background: var(--ds-color-surface-base);
  border-bottom: 1px solid var(--ds-color-border-subtle);
  backdrop-filter: blur(var(--ds-blur-panel));
}

.bar-inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: var(--ds-space-3);
}

.bar-start {
  justify-self: start;
  min-width: 0;
}

.bar-center {
  justify-self: center;
  max-width: 100%;
  align-self: stretch;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

/* Hauteur utile pour les tabs ghost (spacer flex → soulignement en bas de la barre) */
.bar-center :deep(.ds-tabs--ghost) {
  height: 100%;
}

.bar-end {
  justify-self: end;
  flex-shrink: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--ds-space-3);
  min-width: 0;
}

.brand__logo {
  display: block;
  width: var(--ds-size-logo);
  height: auto;
  flex-shrink: 0;
  object-fit: contain;
}

.titles {
  min-width: 0;
}

.ds-heading-page {
  margin: 0;
  font-family: var(--ds-font-family-sans);
  font-size: var(--ds-font-size-2xl);
  font-weight: var(--ds-font-weight-semibold);
  letter-spacing: var(--ds-letter-spacing-wider);
  color: var(--ds-color-text-primary);
}
</style>
