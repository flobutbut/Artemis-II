<script setup>
defineProps({
  modelValue: { type: String, required: true },
  tabs: {
    type: Array,
    required: true,
    /** @type {{ id: string, label: string }[]} */
  },
  /** `default` — onglet actif avec bordure + fond discret. `ghost` — actif souligné, sans encadré. */
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'ghost'].includes(v),
  },
  /** Overrides default `aria-label` on the tablist (e.g. nested panels). */
  ariaLabel: { type: String, default: 'Main sections' },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div
    class="ds-tabs"
    :class="{ 'ds-tabs--ghost': variant === 'ghost' }"
    role="tablist"
    :aria-label="ariaLabel"
  >
    <button
      v-for="t in tabs"
      :id="`tab-${t.id}`"
      :key="t.id"
      type="button"
      class="ds-tabs__tab"
      role="tab"
      :aria-selected="modelValue === t.id"
      :aria-controls="`panel-${t.id}`"
      :tabindex="modelValue === t.id ? 0 : -1"
      :class="{ 'ds-tabs__tab--active': modelValue === t.id }"
      @click="emit('update:modelValue', t.id)"
    >
      <template v-if="variant === 'ghost'">
        <span class="ds-tabs__ghost-fill" aria-hidden="true" />
        <span class="ds-tabs__ghost-stack">
          <span class="ds-tabs__label">{{ t.label }}</span>
          <span class="ds-tabs__ghost-line" aria-hidden="true" />
        </span>
      </template>
      <span v-else class="ds-tabs__label">{{ t.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.ds-tabs {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--ds-space-1);
}

.ds-tabs__tab {
  margin: 0;
  padding: var(--ds-space-2) var(--ds-space-3);
  border: 1px solid transparent;
  border-radius: var(--ds-radius-md);
  background: transparent;
  appearance: none;
  -webkit-appearance: none;
  font-family: var(--ds-font-family-sans);
  font-size: var(--ds-font-size-sm);
  font-weight: var(--ds-font-weight-regular);
  letter-spacing: var(--ds-letter-spacing-tight);
  color: var(--ds-color-text-secondary);
  cursor: pointer;
  transition:
    color var(--ds-duration-fast) var(--ds-ease-standard),
    border-color var(--ds-duration-fast) var(--ds-ease-standard),
    background-color var(--ds-duration-fast) var(--ds-ease-standard);
}

.ds-tabs__tab:hover {
  color: var(--ds-color-text-primary);
  background: var(--ds-color-accent-subtle);
}

.ds-tabs__tab:focus {
  outline: none;
}

.ds-tabs__tab:focus-visible {
  outline: 2px solid var(--ds-color-focus-ring);
  outline-offset: 2px;
}

.ds-tabs__tab--active {
  color: var(--ds-color-text-accent);
  border-color: var(--ds-color-border-interactive);
  background: var(--ds-color-accent-muted);
}

.ds-tabs__tab--active:hover {
  border-color: var(--ds-color-border-interactive-hover);
}

/* Variant ghost — coins droits, gap ; onglets étirés à la même hauteur ; trait en bas de la tab */
.ds-tabs--ghost {
  gap: var(--ds-space-6);
  align-items: stretch;
}

.ds-tabs--ghost .ds-tabs__tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 0;
  position: relative;
  padding-top: var(--ds-space-6);
  padding-right: var(--ds-space-3);
  padding-bottom: var(--ds-space-6);
  padding-left: var(--ds-space-3);
}

.ds-tabs--ghost .ds-tabs__ghost-fill {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  pointer-events: none;
}

/* Colonne label + trait : largeur du texte ; trait ancré au bas du bouton (sous le padding bas) */
.ds-tabs--ghost .ds-tabs__ghost-stack {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  width: max-content;
  max-width: 100%;
  flex-shrink: 0;
  align-self: center;
}

.ds-tabs--ghost .ds-tabs__label {
  flex-shrink: 0;
  margin-bottom: var(--ds-space-2);
  text-align: center;
}

.ds-tabs--ghost .ds-tabs__ghost-line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(-1 * var(--ds-space-6));
  height: 2px;
  background: transparent;
  transition: background-color var(--ds-duration-fast) var(--ds-ease-standard);
}

.ds-tabs--ghost .ds-tabs__tab--active {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
}

.ds-tabs--ghost .ds-tabs__tab--active .ds-tabs__ghost-line {
  background-color: var(--ds-color-accent);
}

.ds-tabs--ghost .ds-tabs__tab--active:hover {
  background: var(--ds-color-accent-subtle);
}

.ds-tabs--ghost .ds-tabs__tab--active:hover .ds-tabs__ghost-line {
  background-color: var(--ds-color-border-interactive-hover);
}
</style>
