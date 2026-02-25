<template>
  <div class="app-shell">
  <header class="app-header">
    <a href="https://www.phila.gov/" class="header-logo">
      <img
        src="https://standards.phila.gov/img/logo/city-of-philadelphia-yellow-white.png"
        alt="City of Philadelphia"
      />
    </a>
    <span class="header-divider" aria-hidden="true"></span>
    <div class="header-title">Property</div>
  </header>
<MainLayout>
    <template #map>
      <MapContainer />
    </template>
    <template #data-panel>
      <DataPanel />
    </template>
  </MainLayout>
  <footer class="app-footer">
    <nav>
      <ul class="footer-nav">
        <li><a href="https://www.phila.gov" target="_blank" rel="noopener">City of Philadelphia</a></li>
        <li>
          <a href="https://form.jotform.com/73aborsi/pde-feedback" target="_blank" rel="noopener">
            Feedback
          </a>
        </li>
      </ul>
    </nav>
  </footer>
  </div>
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
    if (search.searchResults.length > 0 && !search.searchResults[0].hasCondoUnits) {
      ui.selectProperty(search.searchResults[0].opaNumber)
    }
    await property.fetchProperties(search.searchResults.map(r => r.opaNumber))
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
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.app-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: var(--spacing-s) var(--spacing-m);
  background: var(--colors-Dark-Ben-Franklin-Blue);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
}
.header-logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.header-logo:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
.header-logo img {
  height: 50px;
  width: auto;
}
.header-divider {
  width: 1px;
  height: 40px;
  background-color: white;
}
.header-title {
  font-size: 26px;
  font-weight: 600;
}
.app-footer {
  background: var(--colors-Dark-Ben-Franklin-Blue);
  text-align: center;
  padding: var(--spacing-xs) 0;
  font-family: 'Montserrat', sans-serif;
}
.footer-nav {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
}
.footer-nav li {
  display: inline-block;
  padding: 0 var(--spacing-m);
  border-right: 1px solid #fff;
}
.footer-nav li:last-child {
  border-right: none;
}
.footer-nav a {
  color: #fff;
  text-decoration: none;
  font-size: 0.875rem;
}
.footer-nav a:hover {
  color: rgb(37, 206, 247);
}
</style>
