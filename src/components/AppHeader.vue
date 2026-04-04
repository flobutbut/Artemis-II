<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import DsTabs from './DsTabs.vue'
import { publicUrl } from '../lib/public-path.js'

const patchSrc = publicUrl('artemis-ii-patch.svg')

defineProps({
  modelValue: { type: String, required: true },
  tabs: { type: Array, required: true },
})

const emit = defineEmits(['update:modelValue'])

const isCompact = ref(
  typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches,
)
const menuOpen = ref(false)
const barRoot = ref(null)
const menuTopPx = ref(0)

let mqCleanup = () => {}

function updateMenuAnchor() {
  if (!barRoot.value) return
  menuTopPx.value = barRoot.value.getBoundingClientRect().bottom + 8
}

onMounted(() => {
  const mq = window.matchMedia('(max-width: 600px)')
  const sync = () => {
    isCompact.value = mq.matches
  }
  sync()
  mq.addEventListener('change', sync)
  mqCleanup = () => mq.removeEventListener('change', sync)
})

onUnmounted(() => {
  mqCleanup()
  window.removeEventListener('keydown', onMenuEscape)
  window.removeEventListener('resize', updateMenuAnchor)
})

function onMenuEscape(e) {
  if (e.key === 'Escape') menuOpen.value = false
}

watch(menuOpen, async (open) => {
  if (open) {
    window.addEventListener('keydown', onMenuEscape)
    window.addEventListener('resize', updateMenuAnchor)
    await nextTick()
    updateMenuAnchor()
  } else {
    window.removeEventListener('keydown', onMenuEscape)
    window.removeEventListener('resize', updateMenuAnchor)
  }
})

watch(isCompact, (compact) => {
  if (!compact) menuOpen.value = false
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function onMobileTabPick(id) {
  emit('update:modelValue', id)
  menuOpen.value = false
}
</script>

<template>
  <header ref="barRoot" class="bar">
    <div class="bar-inner" :class="{ 'bar-inner--compact': isCompact }">
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
      <nav v-if="!isCompact" class="bar-center" aria-label="Section navigation">
        <DsTabs
          variant="ghost"
          :model-value="modelValue"
          :tabs="tabs"
          @update:model-value="emit('update:modelValue', $event)"
        />
      </nav>
      <div v-if="isCompact" class="bar-end">
        <button
          type="button"
          class="bar-burger ds-btn ds-btn--ghost ds-focusable"
          :aria-expanded="menuOpen"
          aria-controls="bar-menu-panel"
          :aria-label="menuOpen ? 'Close section menu' : 'Open section menu'"
          @click="toggleMenu"
        >
          <span class="bar-burger__line" aria-hidden="true" />
          <span class="bar-burger__line" aria-hidden="true" />
          <span class="bar-burger__line" aria-hidden="true" />
        </button>
      </div>
    </div>
  </header>
  <Teleport to="body">
    <template v-if="isCompact && menuOpen">
      <div class="bar-menu-backdrop" aria-hidden="true" @click="menuOpen = false" />
      <div
        id="bar-menu-panel"
        class="bar-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Section navigation"
        :style="{ top: `${menuTopPx}px` }"
      >
        <DsTabs
          aria-label="Section navigation"
          variant="default"
          :model-value="modelValue"
          :tabs="tabs"
          @update:model-value="onMobileTabPick"
        />
      </div>
    </template>
  </Teleport>
</template>

<style scoped>
.bar {
  position: relative;
  z-index: 20;
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

.bar-inner--compact {
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: auto;
}

.bar-end {
  justify-self: end;
  flex-shrink: 0;
}

.bar-burger {
  flex-direction: column;
  gap: 3px;
  box-sizing: border-box;
  width: 36px;
  height: 36px;
  margin: 0;
  padding: var(--ds-space-2);
}

.bar-burger__line {
  display: block;
  width: 14px;
  height: 1.5px;
  flex-shrink: 0;
  border-radius: 1px;
  background: currentColor;
}

.bar-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 55;
  background: var(--ds-color-scrim-light);
}

.bar-menu {
  position: fixed;
  right: var(--ds-space-3);
  z-index: 60;
  min-width: min(220px, calc(100vw - var(--ds-space-3) * 2));
  padding: var(--ds-space-3);
  background: var(--ds-color-surface-raised);
  border: 1px solid var(--ds-color-border-subtle);
  border-radius: var(--ds-radius-md);
  box-shadow: 0 8px 24px rgba(2, 6, 14, 0.45);
}

.bar-menu :deep(.ds-tabs) {
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  gap: var(--ds-space-2);
}

.bar-menu :deep(.ds-tabs__tab) {
  width: 100%;
  justify-content: flex-start;
}

@media (max-width: 600px) {
  .bar {
    padding: var(--ds-space-4) var(--ds-space-3);
  }

  .brand {
    gap: var(--ds-space-3);
  }

  .brand__logo {
    width: var(--ds-size-logo);
  }

  .ds-heading-page {
    font-size: var(--ds-font-size-2xl);
  }

  .bar-burger {
    width: 42px;
    height: 42px;
    padding: var(--ds-space-3);
  }

  .bar-burger__line {
    width: 16px;
    height: 2px;
  }
}
</style>
