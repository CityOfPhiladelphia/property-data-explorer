<template>
  <div class="search-mode-selector">
    <div class="mode-tabs">
      <button
        v-for="mode in modes"
        :key="mode.value"
        class="mode-tab"
        :class="{ 'is-active': activeMode === mode.value }"
        @click="activeMode = mode.value"
      >
        {{ mode.label }}
      </button>
    </div>

    <div v-if="activeMode === 'block'" class="search-input-row">
      <input
        v-model="blockInput"
        type="text"
        placeholder="Enter block (e.g., 1500 market st)"
        class="search-input"
        @keydown.enter="doBlockSearch"
      />
      <button class="search-btn" @click="doBlockSearch">Search</button>
    </div>

    <div v-if="activeMode === 'owner'" class="search-input-row">
      <input
        v-model="ownerInput"
        type="text"
        placeholder="Enter owner name"
        class="search-input"
        @keydown.enter="doOwnerSearch"
      />
      <button class="search-btn" @click="doOwnerSearch">Search</button>
    </div>

    <div v-if="activeMode === 'shape'" class="search-hint">
      Use the draw tool on the map to select an area.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSearchStore } from '../stores/searchStore'
import { usePropertyStore } from '../stores/propertyStore'
import { useRouter } from 'vue-router'

const search = useSearchStore()
const property = usePropertyStore()
const router = useRouter()

const activeMode = ref<'address' | 'block' | 'owner' | 'shape'>('address')
const blockInput = ref('')
const ownerInput = ref('')

const modes = [
  { label: 'Address', value: 'address' as const },
  { label: 'Block', value: 'block' as const },
  { label: 'Owner', value: 'owner' as const },
  { label: 'Shape', value: 'shape' as const },
]

async function doBlockSearch() {
  if (!blockInput.value.trim()) return
  await search.doBlockSearch(blockInput.value)
  if (search.searchStatus === 'success') {
    await property.fetchProperties(search.searchResults.map(r => r.opaNumber))
    router.push({ query: { block: blockInput.value } })
  }
}

async function doOwnerSearch() {
  if (!ownerInput.value.trim()) return
  await search.doOwnerSearch(ownerInput.value)
  if (search.searchStatus === 'success') {
    await property.fetchProperties(search.searchResults.map(r => r.opaNumber))
    router.push({ query: { owner: ownerInput.value } })
  }
}
</script>

<style scoped>
.search-mode-selector {
  margin-bottom: var(--spacing-l);
}
.mode-tabs {
  display: flex;
  border-bottom: 2px solid var(--Schemes-Outline);
  margin-bottom: var(--spacing-m);
}
.mode-tab {
  padding: var(--spacing-xs) var(--spacing-m);
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
  color: var(--Schemes-On-Surface-Variant);
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: color 0.15s, border-color 0.15s;
}
.mode-tab:hover {
  color: var(--Schemes-On-Surface);
}
.mode-tab.is-active {
  color: var(--colors-Dark-Ben-Franklin-Blue);
  border-bottom-color: var(--colors-Dark-Ben-Franklin-Blue);
}
.search-input-row {
  display: flex;
  gap: var(--spacing-xs);
}
.search-input {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-s);
  border: 1px solid var(--Schemes-Outline);
  border-radius: var(--border-radius-s);
  font-size: 0.875rem;
  font-family: 'Montserrat', sans-serif;
}
.search-input:focus {
  outline: none;
  border-color: var(--colors-Dark-Ben-Franklin-Blue);
  box-shadow: 0 0 0 1px var(--colors-Dark-Ben-Franklin-Blue);
}
.search-btn {
  padding: var(--spacing-xs) var(--spacing-m);
  background: var(--colors-Dark-Ben-Franklin-Blue);
  color: #fff;
  border: none;
  border-radius: var(--border-radius-s);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
}
.search-btn:hover {
  opacity: 0.9;
}
.search-hint {
  font-size: 0.875rem;
  color: var(--Schemes-On-Surface-Variant);
  font-style: italic;
}
</style>
