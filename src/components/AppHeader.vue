<script setup>
import { ref } from 'vue'
import SourcesModal from './SourcesModal.vue'
import SourcesButton from './SourcesButton.vue'

const showSources = ref(false)
</script>

<template>
  <header class="bar">
    <div class="bar-inner">
      <div class="brand">
        <img
          class="brand__logo"
          src="/artemis-ii-patch.svg"
          width="32"
          height="33"
          alt="Artemis II mission insignia (NASA)"
          decoding="async"
        />
        <div class="titles">
          <h1 class="ds-heading-page">Artemis II</h1>
        </div>
      </div>
      <SourcesButton variant="ghost" @click="showSources = true" />
    </div>
    <SourcesModal v-model="showSources" />
  </header>
</template>

<style scoped>
.bar {
  flex-shrink: 0;
  padding: var(--ds-space-3) var(--ds-space-5);
  background: var(--ds-color-surface-base);
  border-bottom: 1px solid var(--ds-color-border-subtle);
  backdrop-filter: blur(var(--ds-blur-panel));
}

.bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-space-4);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--ds-space-3);
  min-width: 0;
}

.brand__logo {
  display: block;
  width: 32px;
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
