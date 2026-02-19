<template>
  <div class="main-layout" :class="{ 'is-fullscreen': ui.fullScreen }">
    <div class="top-row">
      <LeftPanel v-if="ui.isLarge || ui.leftPanelOpen" class="left-panel" />
      <div class="map-area">
        <slot name="map" />
      </div>
    </div>
    <div
      v-if="search.searchStatus === 'success' && !ui.activeOpaNumber"
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
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.top-row {
  display: flex;
  flex: 1;
  min-height: 0;
}

.left-panel {
  width: 50%;
  flex-shrink: 0;
  overflow-y: auto;
  border-right: 1px solid var(--Schemes-Outline);
  background: var(--Schemes-Background);
}

.map-area {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
}

.data-panel {
  max-height: 250px;
  overflow-y: auto;
  border-top: 2px solid var(--colors-Dark-Ben-Franklin-Blue);
  background: var(--Schemes-Background);
}

.data-panel.is-expanded {
  max-height: 50vh;
}

@media (max-width: 749px) {
  .top-row {
    flex-direction: column;
  }
  .left-panel {
    width: 100%;
    border-right: none;
  }
  .map-area {
    min-height: 400px;
  }
}
</style>
