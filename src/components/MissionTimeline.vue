<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import SourcesButton from './SourcesButton.vue'

const props = defineProps({
  missionStart: { type: Date, required: true },
  missionEnd: { type: Date, required: true },
  live: { type: Boolean, default: true },
  at: { type: Date, required: true },
})

const emit = defineEmits(['update:live', 'update:at'])

function clampMs(ms) {
  const a = props.missionStart.getTime()
  const b = props.missionEnd.getTime()
  return Math.min(Math.max(ms, a), b)
}

const tick = ref(0)
let liveTimer = null

watch(
  () => props.live,
  (v) => {
    if (liveTimer) {
      clearInterval(liveTimer)
      liveTimer = null
    }
    if (v) {
      liveTimer = window.setInterval(() => {
        tick.value += 1
      }, 250)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (liveTimer) clearInterval(liveTimer)
})

const effectiveMs = computed(() => {
  void tick.value
  if (props.live) return clampMs(Date.now())
  return clampMs(props.at.getTime())
})

const thumbPct = computed(() => {
  const a = props.missionStart.getTime()
  const b = props.missionEnd.getTime()
  const span = b - a
  if (span <= 0) return 0
  return ((effectiveMs.value - a) / span) * 100
})

const labelText = computed(() => {
  const d = new Date(effectiveMs.value)
  return `${d.toISOString().replace('T', ' ').slice(0, 16)} UTC`
})

const isoDatetime = computed(() => new Date(effectiveMs.value).toISOString())

const trackRef = ref(null)

function seekFromClientX(clientX) {
  const el = trackRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const w = rect.width || 1
  const x = Math.min(Math.max(clientX - rect.left, 0), w)
  const r = x / w
  const t0 = props.missionStart.getTime()
  const t1 = props.missionEnd.getTime()
  const ms = t0 + r * (t1 - t0)
  emit('update:live', false)
  emit('update:at', new Date(ms))
}

function onTrackPointerDown(e) {
  if (e.button !== 0) return
  seekFromClientX(e.clientX)
  window.addEventListener('pointermove', onWindowPointerMove)
  window.addEventListener('pointerup', onWindowPointerUp, { once: true })
}

function onThumbPointerDown(e) {
  if (e.button !== 0) return
  e.stopPropagation()
  emit('update:live', false)
  window.addEventListener('pointermove', onWindowPointerMove)
  window.addEventListener('pointerup', onWindowPointerUp, { once: true })
  try {
    e.currentTarget.setPointerCapture(e.pointerId)
  } catch {
    /* ignore */
  }
}

function onWindowPointerMove(e) {
  seekFromClientX(e.clientX)
}

function onWindowPointerUp(e) {
  window.removeEventListener('pointermove', onWindowPointerMove)
  try {
    e.target?.releasePointerCapture?.(e.pointerId)
  } catch {
    /* ignore */
  }
}

function goLive() {
  emit('update:live', true)
  emit('update:at', new Date())
}

const sliderMin = 0
const sliderMax = 100
const sliderValue = computed(() => Math.round(thumbPct.value * 100) / 100)

function onKeydown(e) {
  const step = (props.missionEnd.getTime() - props.missionStart.getTime()) / 200
  const base = props.live ? Date.now() : props.at.getTime()
  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
    e.preventDefault()
    emit('update:live', false)
    emit('update:at', new Date(clampMs(base - step)))
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
    e.preventDefault()
    emit('update:live', false)
    emit('update:at', new Date(clampMs(base + step)))
  } else if (e.key === 'Home') {
    e.preventDefault()
    emit('update:live', false)
    emit('update:at', new Date(props.missionStart))
  } else if (e.key === 'End') {
    e.preventDefault()
    emit('update:live', false)
    emit('update:at', new Date(props.missionEnd))
  }
}
</script>

<template>
  <div class="mission-timeline" role="group" aria-label="Mission timeline (OEM ephemeris window)">
    <div
      ref="trackRef"
      class="mission-timeline__track"
      @pointerdown="onTrackPointerDown"
    >
      <div class="mission-timeline__range" aria-hidden="true" />
      <div
        class="mission-timeline__progress"
        :style="{ width: `${thumbPct}%` }"
        aria-hidden="true"
      />
      <button
        type="button"
        class="mission-timeline__thumb"
        :style="{ left: `${thumbPct}%` }"
        role="slider"
        :aria-valuemin="sliderMin"
        :aria-valuemax="sliderMax"
        :aria-valuenow="sliderValue"
        :aria-valuetext="labelText"
        :aria-label="live ? 'Mission time (live)' : 'Mission time (scrub)'"
        tabindex="0"
        @pointerdown="onThumbPointerDown"
        @keydown="onKeydown"
      />
    </div>
    <time class="mission-timeline__time" :datetime="isoDatetime">{{ labelText }}</time>
    <SourcesButton variant="ghost" class="mission-timeline__live" @click="goLive">Live</SourcesButton>
  </div>
</template>

<style scoped>
.mission-timeline {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--ds-space-4);
  padding: var(--ds-space-2) var(--ds-space-5);
  background: transparent;
  border: none;
}

.mission-timeline__track {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 22px;
  display: flex;
  align-items: center;
  cursor: pointer;
  touch-action: none;
}

.mission-timeline__range {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 3px;
  margin-top: -1.5px;
  border-radius: 2px;
  background: rgba(110, 184, 255, 0.18);
  pointer-events: none;
}

.mission-timeline__progress {
  position: absolute;
  left: 0;
  top: 50%;
  height: 3px;
  margin-top: -1.5px;
  border-radius: 2px;
  background: rgba(110, 184, 255, 0.42);
  pointer-events: none;
  max-width: 100%;
}

.mission-timeline__thumb {
  position: absolute;
  top: 50%;
  width: 10px;
  height: 18px;
  margin: -9px 0 0 -5px;
  padding: 0;
  border: none;
  border-radius: 2px;
  background: var(--ds-palette-cyan-400);
  box-shadow: 0 0 0 1px rgba(2, 6, 14, 0.35);
  cursor: grab;
  pointer-events: auto;
}

.mission-timeline__thumb:active {
  cursor: grabbing;
}

.mission-timeline__thumb:focus {
  outline: none;
}

.mission-timeline__thumb:focus-visible {
  outline: 2px solid var(--ds-color-focus-ring);
  outline-offset: 2px;
}

.mission-timeline__time {
  flex-shrink: 0;
  font-family: var(--ds-font-family-mono);
  font-size: var(--ds-font-size-xs);
  color: var(--ds-color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.mission-timeline__live {
  flex-shrink: 0;
}
</style>
