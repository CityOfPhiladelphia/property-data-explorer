<template>
  <header class="app-header">Property Data Explorer</header>
  <MainLayout>
    <template #map>
      <MapContainer />
    </template>
    <template #data-panel>
      <!-- DataPanel goes here in Task 7 -->
      <div>Data Panel</div>
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

const route = useRoute()
const router = useRouter()
const search = useSearchStore()
const property = usePropertyStore()
const ui = useUiStore()

onMounted(async () => {
  ui.initResizeListener()
  const { p, block } = route.query
  if (p) {
    await search.doAddressSearch(p as string)
    await property.fetchProperties(search.searchResults.map(r => r.opaNumber))
    ui.selectProperty(p as string)
  } else if (block) {
    await search.doBlockSearch(block as string)
    await property.fetchProperties(search.searchResults.map(r => r.opaNumber))
  }
})
</script>

<style scoped>
.app-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-m);
  background: var(--Schemes-Primary);
  color: var(--Schemes-On-Primary);
  font-weight: 600;
}
</style>
