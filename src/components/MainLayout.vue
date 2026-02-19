<template>
  <div class="main-layout" :class="{ 'is-fullscreen': ui.fullScreen }">
    <div class="top-row">
      <LeftPanel v-if="showLeftPanel" class="left-panel" />
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
import { computed } from 'vue'
import { useUiStore } from '../stores/uiStore'
import { useSearchStore } from '../stores/searchStore'
import LeftPanel from './LeftPanel.vue'

const ui = useUiStore()
const search = useSearchStore()

const showLeftPanel = computed(() => {
  const screenOk = ui.isLarge || ui.leftPanelOpen
  // Show left panel when a property is selected (PropertyCard)
  if (ui.activeOpaNumber) return screenOk
  // Show left panel before search results arrive
  if (search.searchStatus === 'idle' || search.searchStatus === 'loading') return screenOk
  // After search with no selection: hide left panel, map goes full width
  return false
})
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
  height: 250px;
  flex-shrink: 0;
  overflow-y: auto;
  border-top: 2px solid var(--colors-Dark-Ben-Franklin-Blue);
  background: var(--Schemes-Background);
}

.data-panel.is-expanded {
  height: 50vh;
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
