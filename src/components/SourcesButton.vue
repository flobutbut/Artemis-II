<script setup>
defineProps({
  variant: {
    type: String,
    default: 'secondary',
    validator: (v) => ['primary', 'secondary', 'ghost'].includes(v),
  },
})

defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    class="sources-button"
    :class="`sources-button--${variant}`"
    @click="$emit('click')"
  >
    <slot>Sources</slot>
  </button>
</template>

<style scoped>
.sources-button {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ds-space-2);
  margin: 0;
  padding: var(--ds-space-2) var(--ds-space-4);
  border-radius: var(--ds-radius-md);
  font-family: var(--ds-font-family-sans);
  font-size: var(--ds-font-size-base);
  font-weight: var(--ds-font-weight-medium);
  line-height: var(--ds-line-height-tight);
  cursor: pointer;
  transition:
    background-color var(--ds-duration-fast) var(--ds-ease-standard),
    border-color var(--ds-duration-fast) var(--ds-ease-standard),
    color var(--ds-duration-fast) var(--ds-ease-standard);
}

.sources-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.sources-button:focus {
  outline: none;
}

.sources-button:focus-visible {
  outline: 2px solid var(--ds-color-focus-ring);
  outline-offset: 2px;
}

/* Primary : plein accent (CTA) */
.sources-button--primary {
  border: 1px solid var(--ds-palette-cyan-400);
  background: var(--ds-palette-cyan-400);
  color: var(--ds-palette-space-900);
}

.sources-button--primary:hover:not(:disabled) {
  background: var(--ds-palette-cyan-300);
  border-color: var(--ds-palette-cyan-300);
}

/* Secondary : bordure + fond discret */
.sources-button--secondary {
  border: 1px solid var(--ds-color-border-interactive);
  background: var(--ds-color-accent-subtle);
  color: var(--ds-color-text-accent);
}

.sources-button--secondary:hover:not(:disabled) {
  background: var(--ds-color-accent-hover);
  border-color: var(--ds-color-border-interactive-hover);
}

/* Ghost : discret, peu de fond */
.sources-button--ghost {
  border: 1px solid transparent;
  background: transparent;
  color: var(--ds-color-text-accent);
}

.sources-button--ghost:hover:not(:disabled) {
  background: var(--ds-color-accent-subtle);
  border-color: var(--ds-color-border-default);
}
</style>
