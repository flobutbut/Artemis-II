<script setup>
import { ref, computed } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import ArtemisScene from './components/ArtemisScene.vue'
import MissionTimeline from './components/MissionTimeline.vue'
import MissionInfoPanel from './components/MissionInfoPanel.vue'
import { ARTEMIS_II_MISSION } from './lib/horizons.js'
import { MISSION_EVENTS } from './data/mission-events.js'

const MAIN_TABS = [
  { id: 'trajectory', label: 'Trajectory' },
  { id: 'crew', label: 'Crew' },
  { id: 'ship', label: 'Ship' },
  { id: 'mission', label: 'Mission' },
]

const mainTab = ref('trajectory')
const timelineLive = ref(true)
const timelineAt = ref(new Date())

// Precise event times computed from actual Horizons trajectory data (overrides static estimates)
const computedEventTimes = ref({})

function onComputedEvents({ flybyMs, soiMs, entryMs }) {
  computedEventTimes.value = { flybyMs, soiMs, entryMs }
}

const missionEvents = computed(() =>
  MISSION_EVENTS.map((ev) => {
    const t = computedEventTimes.value
    if (ev.id === 'lunar-flyby' && t.flybyMs != null) return { ...ev, timeMs: t.flybyMs }
    if (ev.id === 'lunar-soi'   && t.soiMs   != null) return { ...ev, timeMs: t.soiMs }
    if (ev.id === 'entry'       && t.entryMs  != null) return { ...ev, timeMs: t.entryMs }
    return ev
  }),
)
</script>

<template>
  <div class="layout">
    <AppHeader v-model="mainTab" :tabs="MAIN_TABS" />
    <div class="main-stage">
      <div
        v-show="mainTab === 'trajectory'"
        id="panel-trajectory"
        class="viewport viewport--scene"
        role="tabpanel"
        :aria-hidden="mainTab !== 'trajectory'"
      >
        <ArtemisScene
          :timeline-live="timelineLive"
          :timeline-at="timelineAt"
          :events="missionEvents"
          @computed-events="onComputedEvents"
        />
      </div>
      <MissionInfoPanel
        v-show="mainTab !== 'trajectory'"
        :tab="mainTab"
        class="viewport viewport--info"
        :panel-hidden="mainTab === 'trajectory'"
      />
    </div>
    <MissionTimeline
      v-show="mainTab === 'trajectory'"
      v-model:live="timelineLive"
      v-model:at="timelineAt"
      :mission-start="ARTEMIS_II_MISSION.trajectoryStartUtc"
      :mission-end="ARTEMIS_II_MISSION.trajectoryEndUtc"
      :events="missionEvents"
    />
    <AppFooter />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.main-stage {
  flex: 1;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
}

.viewport {
  flex: 1;
  min-height: 0;
}

.viewport--scene {
  position: relative;
}

.viewport--info {
  min-height: 0;
}
</style>
