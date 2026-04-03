<script setup>
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import ArtemisScene from './components/ArtemisScene.vue'
import MissionTimeline from './components/MissionTimeline.vue'
import { ARTEMIS_II_MISSION } from './lib/horizons.js'

const timelineLive = ref(true)
const timelineAt = ref(new Date())
</script>

<template>
  <div class="layout">
    <AppHeader />
    <ArtemisScene
      class="viewport"
      :timeline-live="timelineLive"
      :timeline-at="timelineAt"
    />
    <MissionTimeline
      v-model:live="timelineLive"
      v-model:at="timelineAt"
      :mission-start="ARTEMIS_II_MISSION.trajectoryStartUtc"
      :mission-end="ARTEMIS_II_MISSION.trajectoryEndUtc"
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

.viewport {
  flex: 1;
  min-height: 0;
  position: relative;
}
</style>
