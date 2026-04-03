<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  events: { type: Array, default: () => [] },
  missionStart: { type: Date, required: true },
  missionEnd: { type: Date, required: true },
  currentAt: { type: Date, required: true },
})

const emit = defineEmits(['seek'])

const hoveredId = ref(null)

const span = computed(() => props.missionEnd.getTime() - props.missionStart.getTime())

function pct(timeMs) {
  if (span.value <= 0) return 0
  const p = ((timeMs - props.missionStart.getTime()) / span.value) * 100
  return Math.min(Math.max(p, 0), 100)
}

function isPast(timeMs) {
  return props.currentAt.getTime() >= timeMs
}

function formatTime(timeMs) {
  return new Date(timeMs).toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
}

function onSeek(ev) {
  emit('seek', ev.timeMs)
}
</script>

<template>
  <div class="mission-events" aria-hidden="true">
    <template v-for="ev in events" :key="ev.id">
      <div
        class="mission-events__pin"
        :style="{ left: `${pct(ev.timeMs)}%` }"
      >
        <button
          type="button"
          class="mission-events__marker"
          :class="[`mission-events__marker--${ev.type}`, { 'is-past': isPast(ev.timeMs) }]"
          :aria-label="ev.label"
          @click.stop="onSeek(ev)"
          @mouseenter="hoveredId = ev.id"
          @mouseleave="hoveredId = null"
          @focus="hoveredId = ev.id"
          @blur="hoveredId = null"
        />

        <Transition name="tip">
          <div
            v-if="hoveredId === ev.id"
            class="mission-events__tooltip"
            role="tooltip"
          >
            <div class="mission-events__tooltip-header">
              <span class="mission-events__type-dot" :class="`mission-events__type-dot--${ev.type}`" />
              <span class="mission-events__tooltip-label">{{ ev.label }}</span>
            </div>
            <p class="mission-events__tooltip-desc">{{ ev.description }}</p>
            <time class="mission-events__tooltip-time">{{ formatTime(ev.timeMs) }}</time>
          </div>
        </Transition>
      </div>
    </template>
  </div>
</template>

<style scoped>
.mission-events {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
}

/* Pin: zero-width column centered on the event timestamp */
.mission-events__pin {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0;
  pointer-events: none;
  overflow: visible;
}

/* Diamond marker on the track */
.mission-events__marker {
  position: absolute;
  top: 50%;
  left: 0;
  width: 9px;
  height: 9px;
  margin: -4.5px 0 0 -4.5px;
  padding: 0;
  border: none;
  border-radius: 2px;
  transform: rotate(45deg);
  cursor: pointer;
  pointer-events: auto;
  z-index: 12;
  opacity: 0.55;
  transition: opacity 120ms ease, transform 120ms ease;
}

.mission-events__marker:hover,
.mission-events__marker:focus-visible {
  opacity: 1;
  transform: rotate(45deg) scale(1.35);
  outline: none;
}

.mission-events__marker.is-past {
  opacity: 0.9;
}

/* Type colors */
.mission-events__marker--milestone { background: var(--ds-palette-cyan-300, #4de8ff); }
.mission-events__marker--burn      { background: #ff9944; }
.mission-events__marker--flyby     { background: #cc66ff; }
.mission-events__marker--reentry   { background: #ff5533; }
.mission-events__marker--landing   { background: #44dd88; }
.mission-events__marker--info      { background: var(--ds-color-text-tertiary, #8899bb); }

/* Tooltip — glass panel floating above the timeline */
.mission-events__tooltip {
  position: absolute;
  bottom: calc(100% + 36px);
  left: 0;
  transform: translateX(-50%);
  width: 230px;
  padding: var(--ds-space-3) var(--ds-space-3);
  background: var(--ds-color-surface-overlay, rgba(5, 10, 22, 0.92));
  border: 1px solid var(--ds-color-border-subtle, rgba(77, 232, 255, 0.18));
  border-radius: var(--ds-radius-md, 6px);
  backdrop-filter: blur(var(--ds-blur-glass, 8px));
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.55);
  pointer-events: none;
  z-index: 200;
}

/* Small caret pointing down */
.mission-events__tooltip::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: var(--ds-color-surface-overlay, rgba(5, 10, 22, 0.92));
  border-right: 1px solid var(--ds-color-border-subtle, rgba(77, 232, 255, 0.18));
  border-bottom: 1px solid var(--ds-color-border-subtle, rgba(77, 232, 255, 0.18));
}

.mission-events__tooltip-header {
  display: flex;
  align-items: center;
  gap: var(--ds-space-2);
  margin-bottom: var(--ds-space-2);
}

.mission-events__type-dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.mission-events__type-dot--milestone { background: var(--ds-palette-cyan-300, #4de8ff); }
.mission-events__type-dot--burn      { background: #ff9944; }
.mission-events__type-dot--flyby     { background: #cc66ff; }
.mission-events__type-dot--reentry   { background: #ff5533; }
.mission-events__type-dot--landing   { background: #44dd88; }
.mission-events__type-dot--info      { background: var(--ds-color-text-tertiary, #8899bb); }

.mission-events__tooltip-label {
  font-family: var(--ds-font-family-sans);
  font-size: var(--ds-font-size-sm, 12px);
  font-weight: var(--ds-font-weight-semibold, 600);
  color: var(--ds-color-text-primary);
  letter-spacing: var(--ds-letter-spacing-tight, 0.3px);
}

.mission-events__tooltip-desc {
  margin: 0 0 var(--ds-space-2);
  font-family: var(--ds-font-family-sans);
  font-size: var(--ds-font-size-xs, 11px);
  color: var(--ds-color-text-secondary);
  line-height: var(--ds-line-height-relaxed, 1.45);
}

.mission-events__tooltip-time {
  display: block;
  font-family: var(--ds-font-family-mono);
  font-size: var(--ds-font-size-2xs, 10px);
  color: var(--ds-color-text-tertiary);
  font-variant-numeric: tabular-nums;
}

/* Transition */
.tip-enter-active,
.tip-leave-active {
  transition: opacity 100ms ease, transform 100ms ease;
}
.tip-enter-from,
.tip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}
</style>
