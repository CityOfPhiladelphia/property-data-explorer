<template>
  <header class="app-header">
    <div class="header-branding">
      <a href="https://www.phila.gov" class="city-link" target="_blank" rel="noopener">
        City of Philadelphia
      </a>
    </div>
    <div class="header-title">Property Data Explorer</div>
    <div class="header-actions">
      <a href="https://form.jotform.com/73aborsi/pde-feedback" target="_blank" rel="noopener" class="feedback-link">
        Feedback
      </a>
    </div>
  </header>
  <MainLayout>
    <template #map>
      <MapContainer />
    </template>
    <template #data-panel>
      <DataPanel />
    </template>
  </MainLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSearchStore } from './stores/searchStore'
import { usePropertyStore } from './stores/propertyStore'
import { useUiStore } from './stores/uiStore'
import MainLayout from './components/MainLayout.vue'
import MapContainer from './components/MapContainer.vue'
import DataPanel from './components/DataPanel.vue'

const route = useRoute()
const router = useRouter()
const search = useSearchStore()
const property = usePropertyStore()
const ui = useUiStore()

onMounted(async () => {
  ui.initResizeListener()
  const { p, block, owner, shape } = route.query
  if (p) {
    await search.doAddressSearch(p as string)
    await property.fetchProperties(search.searchResults.map(r => r.opaNumber))
    ui.selectProperty(p as string)
  } else if (block) {
    await search.doBlockSearch(block as string)
    await property.fetchProperties(search.searchResults.map(r => r.opaNumber))
  } else if (owner) {
    await search.doOwnerSearch(owner as string)
    await property.fetchProperties(search.searchResults.map(r => r.opaNumber))
  } else if (shape) {
    try {
      const geojson = JSON.parse(shape as string)
      await search.doShapeSearch(geojson)
      await property.fetchProperties(search.searchResults.map(r => r.opaNumber))
    } catch (e) {
      console.error('Failed to parse shape from URL:', e)
    }
  }
})
</script>

<style scoped>
.app-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-m);
  background: var(--Schemes-Primary);
  color: var(--Schemes-On-Primary);
  font-weight: 600;
}
.header-branding .city-link {
  color: var(--Schemes-On-Primary);
  text-decoration: none;
  font-size: 0.875rem;
  opacity: 0.8;
}
.header-branding .city-link:hover {
  opacity: 1;
}
.header-title {
  font-size: 1.125rem;
}
.header-actions .feedback-link {
  color: var(--Schemes-On-Primary);
  text-decoration: none;
  font-size: 0.875rem;
  opacity: 0.8;
}
.header-actions .feedback-link:hover {
  opacity: 1;
}
</style>
