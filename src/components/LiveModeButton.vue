<script setup>
defineProps({
  live: { type: Boolean, default: false },
})

defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    class="live-mode-button"
    :class="{ 'live-mode-button--on': live }"
    :aria-pressed="live"
    :aria-label="live ? 'Live mode on' : 'Not live — click to resume live updates'"
    @click="$emit('click')"
  >
    <span class="live-mode-button__dot" aria-hidden="true" />
    <span class="live-mode-button__label">Live</span>
  </button>
</template>

<style scoped>
.live-mode-button {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--ds-space-1);
  margin: 0;
  padding: var(--ds-space-1) var(--ds-space-2);
  border: 1px solid var(--ds-color-neutral-border);
  border-radius: var(--ds-radius-sm);
  background: transparent;
  font-family: var(--ds-font-family-sans);
  font-size: var(--ds-font-size-2xs);
  font-weight: var(--ds-font-weight-semibold);
  letter-spacing: var(--ds-letter-spacing-tight);
  text-transform: uppercase;
  color: var(--ds-color-text-secondary);
  cursor: pointer;
  transition:
    border-color var(--ds-duration-fast) var(--ds-ease-standard),
    color var(--ds-duration-fast) var(--ds-ease-standard),
    box-shadow var(--ds-duration-fast) var(--ds-ease-standard);
}

.live-mode-button:hover {
  border-color: var(--ds-color-neutral-border-hover);
  color: var(--ds-color-text-primary);
}

.live-mode-button--on {
  border-color: var(--ds-color-red-border);
  color: var(--ds-color-red-text);
}

.live-mode-button--on:hover {
  border-color: var(--ds-color-red-border-hover);
  color: var(--ds-color-red-text-hover);
}

.live-mode-button__dot {
  width: var(--ds-size-dot);
  height: var(--ds-size-dot);
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--ds-color-neutral-fill);
  box-shadow: 0 0 0 1px var(--ds-color-neutral-ring);
  transition:
    background-color var(--ds-duration-fast) var(--ds-ease-standard),
    box-shadow var(--ds-duration-fast) var(--ds-ease-standard);
}

.live-mode-button--on .live-mode-button__dot {
  background: var(--ds-color-red-fill);
  box-shadow:
    0 0 0 1px var(--ds-color-red-ring),
    var(--ds-shadow-red-soft);
}

.live-mode-button:focus {
  outline: none;
}

.live-mode-button:focus-visible {
  outline: 2px solid var(--ds-color-focus-ring);
  outline-offset: 2px;
}

.live-mode-button__label {
  line-height: var(--ds-line-height-tight);
}
</style>
