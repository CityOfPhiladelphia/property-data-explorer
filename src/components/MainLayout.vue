<template>
  <div class="main-layout" :class="{ 'is-fullscreen': ui.fullScreen }">
    <LeftPanel v-if="ui.isLarge || ui.leftPanelOpen" class="left-panel" />
    <div class="map-area">
      <slot name="map" />
    </div>
    <div
      v-if="search.searchStatus === 'success'"
      class="data-panel"
      :class="{ 'is-expanded': ui.dataPanelExpanded }"
    >
      <slot name="data-panel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '../stores/uiStore'
import { useSearchStore } from '../stores/searchStore'
import LeftPanel from './LeftPanel.vue'

const ui = useUiStore()
const search = useSearchStore()
</script>

<style scoped>
.main-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  grid-template-rows: 1fr auto;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.left-panel {
  grid-row: 1 / -1;
  overflow-y: auto;
  border-right: 1px solid var(--Schemes-Outline);
}

.map-area {
  grid-column: 2;
  grid-row: 1;
  min-height: 0;
}

.data-panel {
  grid-column: 2;
  grid-row: 2;
  max-height: 250px;
  overflow-y: auto;
  border-top: 1px solid var(--Schemes-Outline);
}

.data-panel.is-expanded {
  max-height: 50vh;
}

@media (max-width: 1023px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
  .left-panel {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    background: var(--Schemes-Surface);
    border-right: none;
  }
}
</style>
